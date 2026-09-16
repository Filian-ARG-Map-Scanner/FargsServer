import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import ScanJob from './ScanJob.entity';

@Entity()
export default class Client {
  @PrimaryColumn()
  id: string;

  @Column()
  version: string;

  @OneToOne(() => ScanJob, (scanJob) => scanJob.client)
  @JoinColumn()
  scanJob: ScanJob | null = null;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
