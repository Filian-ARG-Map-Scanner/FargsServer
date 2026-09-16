import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import Client from './Client.entity';
import { DimEnum } from '../../utils/types';

@Entity()
@Unique(['dimension', 'dimensionIndex'])
export default class ScanJob {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: DimEnum,
  })
  dimension: DimEnum;

  @Column()
  dimensionIndex: number;

  @Column()
  regionIndex: number;

  @OneToOne(() => Client, (client) => client.scanJob)
  client: Client | null = null;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
