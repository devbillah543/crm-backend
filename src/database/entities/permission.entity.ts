import { Column, Entity } from 'typeorm';
import { UuidPrimaryEntity } from './base.entity';

@Entity('permissions')
export class Permission extends UuidPrimaryEntity {
  @Column({ type: 'varchar', unique: true, length: 64 })
  code!: string;

  @Column({ name: 'display_name', type: 'varchar', length: 128, nullable: true })
  displayName!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  category!: string | null;
}
