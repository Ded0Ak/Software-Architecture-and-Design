export class Repository<T extends { id: number }> {
  constructor(private items: T[]) {}

  add(entity: T): void {
    this.items.push(entity);
  }

  getAll(): T[] {
    return this.items;
  }

  getById(id: number): T | undefined {
    return this.items.find(x => x.id === id);
  }

  update(entity: T): void {
    const index = this.items.findIndex(x => x.id === entity.id);
    if (index === -1) throw new Error("Entity not found");
    this.items[index] = entity;
  }

  delete(id: number): void {
    const index = this.items.findIndex(x => x.id === id);
    if (index === -1) throw new Error("Entity not found");
    this.items.splice(index, 1);
  }
}