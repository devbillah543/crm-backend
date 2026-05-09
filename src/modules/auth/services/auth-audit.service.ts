import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AuditLogRepository } from '../repositories/audit-log.repository';

type AuditValue = Record<string, unknown> | string | number | boolean | null | unknown[];

@Injectable()
export class AuthAuditService {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async log(
    userId: string | null,
    operation: string,
    fieldName: string,
    newValue: AuditValue,
    oldValue?: AuditValue,
  ): Promise<void> {
    const entry = this.auditLogRepository.create({
      tableName: 'users',
      recordId: userId ?? randomUUID(),
      fieldName,
      operation,
      actorType: userId ? 'user' : 'system',
      oldValue: oldValue ?? null,
      newValue,
      changeGroupId: randomUUID(),
      changedByUserId: userId,
      changedAt: new Date(),
    });

    await this.auditLogRepository.save(entry);
  }
}
