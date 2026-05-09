import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../../database/entities/audit-log.entity';

@Injectable()
export class AuditLogRepository {
  constructor(
    @InjectRepository(AuditLog) private readonly repository: Repository<AuditLog>,
  ) {}

  create(values: Partial<AuditLog>): AuditLog {
    return this.repository.create(values);
  }

  save(entry: AuditLog): Promise<AuditLog> {
    return this.repository.save(entry);
  }
}
