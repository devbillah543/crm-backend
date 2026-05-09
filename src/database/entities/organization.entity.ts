import { Column, Entity, OneToMany } from 'typeorm';
import { TimestampedEntity } from './base.entity';
import { Brand } from './brand.entity';

@Entity('organizations')
export class Organization extends TimestampedEntity {
  @Column({ type: 'varchar', unique: true, length: 32 })
  code!: string;

  @Column({ name: 'display_name', type: 'varchar', length: 128 })
  displayName!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @OneToMany(() => Brand, (brand) => brand.organization)
  brands!: Brand[];
}
