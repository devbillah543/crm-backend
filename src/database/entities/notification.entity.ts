import { Column, Entity } from 'typeorm';
import { TimestampedEntity } from './base.entity';

@Entity('notifications')
export class Notification extends TimestampedEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 64 })
  type!: string;

  @Column({ type: 'varchar', length: 128 })
  title!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'jsonb', nullable: true })
  payload!: Record<string, unknown> | null;

  @Column({ name: 'is_read', default: false })
  isRead!: boolean;
}
