import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DimEnum as DimEnum } from '../../utils/types';

@Entity()
export default class Dimension {
  @PrimaryColumn({ type: 'enum', enum: DimEnum })
  id: DimEnum;

  @Column('int', { default: [], array: true })
  indexesScanned: number[] = [];

  @Column()
  dimensionWidth: number;

  @Column('varchar', { default: [], array: true })
  blockBlacklist: string[] = [];

  @Column()
  scanRange: number;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
