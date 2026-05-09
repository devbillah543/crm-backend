import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('user_brands')
export class UserBrand {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @PrimaryColumn({ name: 'brand_id', type: 'uuid' })
  brandId!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'assigned_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt!: Date;
}
