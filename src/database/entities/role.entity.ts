import { Column, Entity } from 'typeorm';
import { UuidPrimaryEntity } from './base.entity';

@Entity('roles')
export class Role extends UuidPrimaryEntity {
  @Column({ type: 'varchar', unique: true, length: 32 })
  code!: string;

  @Column({ name: 'display_name', type: 'varchar', length: 128, nullable: true })
  displayName!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'is_system', default: false })
  isSystem!: boolean;
}
