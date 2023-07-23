import { Subscription } from 'rxjs';
import { EventBusService, IEvent } from './eventBus.service';
import { AppLogger } from '../AppLogger';

export abstract class BaseEventService {
  private subscriptions: Subscription[] = [];

  constructor(
    protected readonly eventBus: EventBusService,
    protected readonly log: AppLogger,
  ) {}

  protected addSubscription(...subscription: Subscription[]): void {
    this.subscriptions.push(...subscription);
  }

  protected abstract getEventHandlers(): Record<
    string,
    (payload: any) => Promise<void>
  >;

  protected initializeEventListeners() {
    const handlers = this.getEventHandlers();
    Object.entries(handlers).forEach(([eventType, handler]) => {
      const boundHandler = handler.bind(this);
      const subscription = this.eventBus
        .onEvent(eventType)
        .subscribe((event: IEvent<any>) => {
          this.log.logInfo('Event received:', event);

          if (event.payload) {
            boundHandler(event.payload).catch((error) => {
              this.log.logError(error);
            });
          }
        });

      this.addSubscription(subscription);
    });
  }

  protected clearSubscriptions(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions = [];
  }
}
