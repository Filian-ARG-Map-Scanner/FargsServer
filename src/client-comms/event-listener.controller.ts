import { Controller, Inject, UseFilters } from '@nestjs/common';
import {
  ClientProxy,
  MessagePattern,
  RpcException,
} from '@nestjs/microservices';
import { MessageType } from './types/MessageType';
import { Message } from './types/Message';
import FoundBlock from '../database/entites/FoundBlock.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Client from '../database/entites/Client.entity';
import ScanJob from '../database/entites/ScanJob.entity';
import Dimension from '../database/entites/Dimension.entity';
import { DimEnum } from '../utils/types';
import { ScanMangerService } from './scan-manger.service';
import { REGION_SIZE } from '../config/Constants';
import { ExceptionFilter } from './ExceptionFilter';

@UseFilters(new ExceptionFilter())
@Controller()
export class EventListenerController {
  constructor(
    @Inject('CLIENT_DIRECT_SERVICE') private client: ClientProxy,
    @InjectRepository(FoundBlock)
    private foundBlocksRepository: Repository<FoundBlock>,
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    @InjectRepository(ScanJob)
    private scanJobRepository: Repository<ScanJob>,
    @InjectRepository(Dimension)
    private dimensionRepository: Repository<Dimension>,
    private scanMangerService: ScanMangerService,
  ) {}
  @MessagePattern(MessageType.INIT)
  async onInit(data: Message<MessageType.INIT>): Promise<void> {
    let client = await this.clientsRepository.findOneBy({ id: data.from });
    if (!client) {
      client = this.clientsRepository.create({ id: data.from });
    }
    client.version = data.data;
    await this.clientsRepository.save(client);

    const dims = await this.dimensionRepository.find();
    if (dims.length < 3) {
      throw new RpcException('Dims not populated.');
    }
    this.client.emit(
      data.from,
      new Message(MessageType.BLACKLIST, {
        [DimEnum.OVERWORLD]: dims
          .filter((value) => value.id === DimEnum.OVERWORLD)
          .flatMap((v) => v.blockBlacklist),
        [DimEnum.END]: dims
          .filter((value) => value.id === DimEnum.END)
          .flatMap((v) => v.blockBlacklist),
        [DimEnum.NETHER]: dims
          .filter((value) => value.id === DimEnum.NETHER)
          .flatMap((v) => v.blockBlacklist),
      }),
    );
    //TODO: Version check
  }
  @MessagePattern(MessageType.REGION_REQUEST)
  async onRegionRequest(
    data: Message<MessageType.REGION_REQUEST>,
  ): Promise<void> {
    const client = await this.clientsRepository.findOne({
      where: { id: data.from },
      relations: { scanJob: true },
    });
    if (client == null) {
      throw new RpcException('Client not found');
    }
    const scanJob = await this.scanMangerService.getJob(data.data, client);
    if (scanJob == undefined) {
      this.client.emit(
        data.from,
        new Message(MessageType.DIMENSION_COMPLETE, undefined),
      );
      return;
    }
    const job = this.scanMangerService.getHilbert(
      scanJob.dimension,
      scanJob.dimensionIndex,
    );
    this.client.emit(
      data.from,
      new Message(MessageType.REGION_REQUEST_RESPONSE, {
        index: scanJob.dimensionIndex,
        x: job.x,
        z: job.z,
        width: REGION_SIZE,
        isResume: scanJob.dimensionIndex != 0,
      }),
    );
  }

  @MessagePattern(MessageType.DISCONNECT)
  async onDisconnect(data: Message<MessageType.DISCONNECT>): Promise<void> {
    const client = await this.clientsRepository.findOne({
      where: { id: data.from },
      relations: { scanJob: true },
    });
    if (client == null) {
      throw new RpcException('Client not found');
    }
    if (client.scanJob !== undefined && client.scanJob !== null) {
      await this.scanMangerService.returnJob(client.scanJob);
    }
  }

  @MessagePattern(MessageType.SCAN_RESULT)
  async onScanResult(data: Message<MessageType.SCAN_RESULT>): Promise<void> {
    const client = await this.clientsRepository.findOne({
      where: { id: data.from },
      relations: { scanJob: true },
    });
    if (client == null) {
      throw new RpcException('Client not found');
    }
    if (client.scanJob === null || client.scanJob === undefined) {
      throw new RpcException('Client does not have a scan job');
    }
    const dbBlocks: FoundBlock[] = [];
    for (const block of data.data.data) {
      let dbBlock = await this.foundBlocksRepository.findOneBy({
        pos: [block.x, block.y, block.z],
        dimension: block.dimension,
      });
      if (dbBlock && (dbBlock.checked || dbBlock.blockId !== block.blockId)) {
        dbBlock.checked = false;
      } else if (dbBlock === null) {
        dbBlock = this.foundBlocksRepository.create({
          blockId: block.blockId,
          dimension: block.dimension,
          pos: [block.x, block.y, block.z],
          checked: false,
        });
      } else {
        continue;
      }
      dbBlocks.push(dbBlock);
    }
    await this.foundBlocksRepository.save(dbBlocks);
    client.scanJob.regionIndex = data.data.index;
    await this.scanJobRepository.save(client.scanJob);
  }

  @MessagePattern(MessageType.REGION_COMPLETE)
  async onRegionComplete(data: Message<MessageType.REGION_COMPLETE>) {
    const client = await this.clientsRepository.findOne({
      where: { id: data.from },
      relations: { scanJob: true },
    });
    if (client == null) {
      throw new RpcException('Client not found');
    }
    if (client.scanJob === null || client.scanJob === undefined) {
      throw new RpcException('Client does not have a scan job');
    }
    await this.scanMangerService.completeJob(client.scanJob);
    const nextJob = await this.scanMangerService.getJob(
      client.scanJob.dimension,
      client,
    );
    if (nextJob === undefined) {
      this.client.emit(
        data.from,
        new Message(MessageType.DIMENSION_COMPLETE, undefined),
      );
      return;
    }
    const jobPoint = this.scanMangerService.getHilbert(
      nextJob.dimension,
      nextJob.dimensionIndex,
    );
    this.client.emit(
      data.from,
      new Message(MessageType.REGION_REQUEST_RESPONSE, {
        index: nextJob.regionIndex,
        x: jobPoint.x,
        z: jobPoint.z,
        width: REGION_SIZE,
        isResume: nextJob.regionIndex !== 0,
      }),
    );
  }
}
