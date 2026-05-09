import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import type { Observable } from 'rxjs';
import type { RequestContextState } from '../../common/types/request-context.type';

@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<RequestContextState>();

  run<T>(context: RequestContextState, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  runObservable<T>(
    context: RequestContextState,
    sourceFactory: () => Observable<T>,
  ): Observable<T> {
    return this.storage.run(context, sourceFactory);
  }

  get(): RequestContextState | undefined {
    return this.storage.getStore();
  }
}
