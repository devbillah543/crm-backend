import {
  BeforeInsert,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export abstract class BaseUuidEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @BeforeInsert()
  assignId(): void {
    this.id = this.id ?? uuidv4();
  }
}

export abstract class TimestampedEntity extends BaseUuidEntity {
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  @Index()
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

export abstract class SoftDeletableEntity extends TimestampedEntity {
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  @Index()
  deletedAt!: Date | null;
}
