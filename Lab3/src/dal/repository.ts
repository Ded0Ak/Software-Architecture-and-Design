export interface IRepository<T> {
  getAll(): T[];
  getById(id: number): T | undefined;
  add(entity: T): void;
  update(entity: T): void;
  remove(id: number): void;
}

export class Repository<T extends { id: number }> implements IRepository<T> {
  constructor(private store: T[]) {}

  getAll(): T[] {
    return [...this.store];
  }

  getById(id: number): T | undefined {
    return this.store.find(x => x.id === id);
  }

  add(entity: T): void {
    this.store.push(entity);
  }

  update(entity: T): void {
    const index = this.store.findIndex(x => x.id === entity.id);
    if (index >= 0) this.store[index] = entity;
  }

  remove(id: number): void {
    const index = this.store.findIndex(x => x.id === id);
    if (index >= 0) this.store.splice(index, 1);
  }
}