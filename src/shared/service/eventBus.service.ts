import { Injectable } from '@nestjs/common';
import { Subject, Observable, catchError, EMPTY } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface IEvent<T> {
  type: string;
  payload?: T;
}

@Injectable()
export class EventBusService {
  private events$ = new Subject<IEvent<any>>();

  publish<T>(event: IEvent<T>) {
    this.events$.next(event);
  }

  onEvent<T>(eventType: string): Observable<IEvent<T>> {
    return this.events$.pipe(
      filter((event) => event.type === eventType),
      catchError((err) => {
        console.error('Error occurred:', err);
        return EMPTY;
      }),
    );
  }
}
