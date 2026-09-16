import { Injectable } from '@nestjs/common';
import {
  END_SIZE,
  NETHER_SIZE,
  OVERWORLD_SIZE,
  REGION_SIZE,
} from '../config/Constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Dimension from '../database/entites/Dimension.entity';

import { DimEnum as DimEnum, Point } from '../utils/types';
import ScanJob from '../database/entites/ScanJob.entity';
import Client from '../database/entites/Client.entity';

@Injectable()
export class ScanMangerService {
  jobs: { [key in DimEnum]: number[] } = {
    [DimEnum.END]: [],
    [DimEnum.NETHER]: [],
    [DimEnum.OVERWORLD]: [],
  };

  constructor(
    @InjectRepository(Dimension)
    private dimensionRepository: Repository<Dimension>,
    @InjectRepository(ScanJob)
    private scanJobsRepository: Repository<ScanJob>,
  ) {
    void this.setupJobLists();
  }

  async setupJobLists(): Promise<void> {
    const currentJobs = await this.scanJobsRepository.find({
      relations: { client: true },
    });
    const overworldJobs = currentJobs
      .filter(
        (job) =>
          job.dimension === DimEnum.OVERWORLD && job.client !== undefined,
      )
      .map((job) => job.dimensionIndex);
    const endJobs = currentJobs
      .filter(
        (job) => job.dimension === DimEnum.END && job.client !== undefined,
      )
      .map((job) => job.dimensionIndex);
    const netherJobs = currentJobs
      .filter(
        (job) => job.dimension === DimEnum.NETHER && job.client !== undefined,
      )
      .map((job) => job.dimensionIndex);
    let overworld = await this.dimensionRepository.findOneBy({
      id: DimEnum.OVERWORLD,
    });
    if (overworld == null) {
      overworld = this.dimensionRepository.create({
        id: DimEnum.OVERWORLD,
        dimensionWidth: OVERWORLD_SIZE,
      });
      await this.dimensionRepository.save(overworld);
    }
    let nether = await this.dimensionRepository.findOneBy({
      id: DimEnum.NETHER,
    });
    if (nether == null) {
      nether = this.dimensionRepository.create({
        id: DimEnum.NETHER,
        dimensionWidth: NETHER_SIZE,
      });
      await this.dimensionRepository.save(nether);
    }
    let end = await this.dimensionRepository.findOneBy({
      id: DimEnum.END,
    });
    if (end == null) {
      end = this.dimensionRepository.create({
        id: DimEnum.END,
        dimensionWidth: END_SIZE,
      });
      await this.dimensionRepository.save(end);
    }
    for (
      let i = 0;
      i < (OVERWORLD_SIZE / REGION_SIZE) * (OVERWORLD_SIZE / REGION_SIZE);
      i++
    ) {
      if (!(overworld.indexesScanned.includes(i) && overworldJobs.includes(i)))
        this.jobs[DimEnum.OVERWORLD].push(i);
    }
    for (
      let i = 0;
      i < (END_SIZE / REGION_SIZE) * (END_SIZE / REGION_SIZE);
      i++
    ) {
      if (!(end.indexesScanned.includes(i) && endJobs.includes(i)))
        this.jobs[DimEnum.END].push(i);
    }
    for (
      let i = 0;
      i < (NETHER_SIZE / REGION_SIZE) * (NETHER_SIZE / REGION_SIZE);
      i++
    ) {
      if (!(nether.indexesScanned.includes(i) && netherJobs.includes(i)))
        this.jobs[DimEnum.NETHER].push(i);
    }
  }
  async getJob(
    dimension: DimEnum,
    client: Client,
  ): Promise<ScanJob | undefined> {
    let scanJob = await this.scanJobsRepository.findOneBy({
      dimension,
      client,
    });
    if (scanJob != null) return scanJob;
    const index = this.jobs[dimension].pop();
    if (index == undefined) {
      return undefined;
    }
    scanJob = await this.scanJobsRepository.findOneBy({
      dimension,
      dimensionIndex: index,
    });
    if (scanJob == null) {
      scanJob = this.scanJobsRepository.create({
        dimension,
        dimensionIndex: index,
        client,
      });
    } else {
      scanJob.client = client;
    }
    await this.scanJobsRepository.save(scanJob);
    return scanJob;
  }

  async returnJob(job: ScanJob) {
    job.client = null;
    await this.scanJobsRepository.save(job);
    this.jobs[job.dimension].push(job.dimensionIndex);
  }

  async completeJob(scanJob: ScanJob) {
    const dim = await this.dimensionRepository.findOneBy({
      id: scanJob.dimension,
    });

    if (!dim) {
      throw new Error(`Could not find dimension ${scanJob.dimension}`);
    }
    await this.scanJobsRepository.remove(scanJob);
    dim.indexesScanned.push(scanJob.dimensionIndex);
    await this.dimensionRepository.save(dim);
  }

  getHilbert(dimension: DimEnum, i: number): Point {
    let order = 0;
    switch (dimension) {
      case DimEnum.END:
        order = Math.floor(Math.log2(END_SIZE / REGION_SIZE));
        break;
      case DimEnum.NETHER:
        order = Math.floor(Math.log2(NETHER_SIZE / REGION_SIZE));
        break;
      case DimEnum.OVERWORLD:
        order = Math.floor(Math.log2(OVERWORLD_SIZE / REGION_SIZE));
        break;
    }

    const points = [
      new Point(0, 0),
      new Point(0, 1),
      new Point(1, 1),
      new Point(1, 0),
    ];

    let index = i & 3;
    let v = points[index];
    for (let j = 1; j < order; j++) {
      i = i >>> 2;
      index = i & 3;
      const len = 1 << j;
      switch (index) {
        case 0:
          v = new Point(v.z, v.x);
          break;
        case 1:
          v = new Point(v.x, v.z + len);
          break;
        case 2:
          v = new Point(v.x + len, v.z + len);
          break;
        case 3:
          new Point(len - 1 - v.z + len, len - 1 - v.x);
          break;
      }
    }
    return v.multiply(REGION_SIZE);
  }
}
