import { DomainError } from "../errors/DomainError";

export class Teacher {
  public readonly id: string;
  public readonly name: string;

  private busySlots: Set<string> = new Set();

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  canTeachAt(slotKey: string): boolean {
    return !this.busySlots.has(slotKey);
  }

  reserveSlot(slotKey: string): void {
    if (this.busySlots.has(slotKey)) {
      throw new DomainError(`Викладач ${this.name} уже зайнятий у слоті ${slotKey}.`);
    }
    this.busySlots.add(slotKey);
  }

  releaseSlot(slotKey: string): void {
    this.busySlots.delete(slotKey);
  }
}