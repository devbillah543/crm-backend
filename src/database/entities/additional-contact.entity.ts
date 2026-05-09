import { Column, Entity } from 'typeorm';
import { TimestampedEntity } from './base.entity';

@Entity('additional_contacts')
export class AdditionalContact extends TimestampedEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 128, nullable: true })
  firstName!: string | null;

  @Column({ name: 'last_name', type: 'varchar', length: 128, nullable: true })
  lastName!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name!: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  role!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string | null;
}
