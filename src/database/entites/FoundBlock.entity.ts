import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { DimEnum } from '../../utils/types';

@Entity()
@Unique(['dimension', 'pos'])
export default class FoundBlock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  blockId: string;

  @Column({
    type: 'enum',
    enum: DimEnum,
  })
  dimension: DimEnum;

  @Column({
    default: false,
  })
  checked: boolean = false;

  @Column('vector', { length: 3 })
  pos: number[] | Buffer;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
