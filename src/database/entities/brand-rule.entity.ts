import { Column, Entity } from 'typeorm';
import { TimestampedEntity } from './base.entity';

@Entity('brand_rules')
export class BrandRule extends TimestampedEntity {
  @Column({ name: 'brand_id', type: 'uuid' })
  brandId!: string;

  @Column({ name: 'rule_type', type: 'varchar', length: 64 })
  ruleType!: string;

  @Column({ name: 'rule_key', type: 'varchar', length: 128 })
  ruleKey!: string;

  @Column({ name: 'rule_value', type: 'jsonb' })
  ruleValue!: Record<string, unknown>;

  @Column({ type: 'text', nullable: true })
  description!: string | null;
}
