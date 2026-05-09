import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TimestampedEntity } from './base.entity';
import { Organization } from './organization.entity';

@Entity('brands')
export class Brand extends TimestampedEntity {
  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId!: string;

  @Column({ name: 'parent_brand_id', type: 'uuid', nullable: true })
  parentBrandId!: string | null;

  @Column({ type: 'varchar', unique: true, length: 32 })
  code!: string;

  @Column({ name: 'display_name', type: 'varchar', length: 128 })
  displayName!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @ManyToOne(() => Organization, (organization) => organization.brands)
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;
}
