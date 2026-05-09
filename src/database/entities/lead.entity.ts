import { Column, Entity } from 'typeorm';
import { TimestampedEntity } from './base.entity';

@Entity('leads')
export class Lead extends TimestampedEntity {
  @Column({ name: 'lead_id_external', type: 'varchar', length: 64, nullable: true })
  leadIdExternal!: string | null;

  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId!: string | null;

  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true })
  fullName!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phone!: string | null;

  @Column({ name: 'phone_extension', type: 'varchar', length: 16, nullable: true })
  phoneExtension!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  role!: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  timezone!: string | null;

  @Column({ name: 'contact_type', type: 'varchar', length: 32, nullable: true })
  contactType!: string | null;

  @Column({ name: 'not_work_anymore', default: false })
  notWorkAnymore!: boolean;

  @Column({ name: 'old_phones', type: 'jsonb', default: () => "'[]'" })
  oldPhones!: unknown[];

  @Column({ name: 'created_by_user_id', type: 'uuid', nullable: true })
  createdByUserId!: string | null;
}
