import { Column, Entity } from 'typeorm';
import { TimestampedEntity } from './base.entity';

@Entity('cross_brand_rules')
export class CrossBrandRule extends TimestampedEntity {
  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({ name: 'trigger_event', type: 'varchar', length: 64 })
  triggerEvent!: string;

  @Column({ type: 'jsonb' })
  condition!: Record<string, unknown>;

  @Column({ type: 'jsonb' })
  action!: Record<string, unknown>;

  @Column({ type: 'int', default: 100 })
  priority!: number;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ type: 'text', nullable: true })
  description!: string | null;
}
