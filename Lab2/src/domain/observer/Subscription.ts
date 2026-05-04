export class Subscription {
  private readonly onUnsubscribe: () => void;
  private active = true;

  constructor(onUnsubscribe: () => void) {
    this.onUnsubscribe = onUnsubscribe;
  }

  public unsubscribe(): void {
    if (!this.active) return;
    this.active = false;
    this.onUnsubscribe();
  }
}