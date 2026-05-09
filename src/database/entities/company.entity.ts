import { Column, Entity } from 'typeorm';
import { TimestampedEntity } from './base.entity';

@Entity('companies')
export class Company extends TimestampedEntity {
  @Column({ name: 'company_symbol', type: 'varchar', unique: true, length: 16 })
  companySymbol!: string;

  @Column({ name: 'company_name', type: 'varchar', length: 255 })
  companyName!: string;

  @Column({ name: 'company_type', type: 'varchar', length: 32, nullable: true })
  companyType!: string | null;

  @Column({ name: 'previous_company_symbol', type: 'varchar', length: 16, nullable: true })
  previousCompanySymbol!: string | null;

  @Column({ name: 'previous_company_name', type: 'varchar', length: 255, nullable: true })
  previousCompanyName!: string | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  cusip!: string | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  cik!: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  country!: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  city!: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  state!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  zip!: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  timezone!: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  website!: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  twitter!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'estimated_marketcap', type: 'numeric', precision: 20, scale: 2, nullable: true })
  estimatedMarketcap!: string | null;

  @Column({ name: 'created_by_user_id', type: 'uuid', nullable: true })
  createdByUserId!: string | null;
}
