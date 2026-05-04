import { Observer } from "./Observer";
import { Subscription } from "./Subscription";

export class EventSubject<TEvent> {
  private observers = new Set<Observer<TEvent>>();

  public subscribe(observer: Observer<TEvent>): Subscription {
    this.observers.add(observer);
    return new Subscription(() => this.observers.delete(observer));
  }

  public notify(event: TEvent): void {
    for (const o of this.observers) {
      o.update(event);
    }
  }
}