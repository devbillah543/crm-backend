import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Observable } from 'rxjs';
import { RequestContextService } from '../../core/request-context/request-context.service';
import type { JwtUser } from '../types/jwt-user.type';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  constructor(private readonly requestContextService: RequestContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{
      id?: string;
      url?: string;
      method?: string;
      user?: JwtUser;
    }>();

    const current = this.requestContextService.get();
    const requestId = request.id ?? current?.requestId ?? randomUUID();

    return this.requestContextService.runObservable(
      {
        requestId,
        path: request.url,
        method: request.method,
        actorType: request.user ? 'user' : current?.actorType ?? 'api',
        actorUserId: request.user?.userId ?? current?.actorUserId ?? null,
        actorEmail: request.user?.email ?? current?.actorEmail ?? null,
      },
      () => next.handle(),
    );
  }
}
