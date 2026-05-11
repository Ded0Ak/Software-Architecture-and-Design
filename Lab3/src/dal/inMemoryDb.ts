import { DesignOrderEntity, PortfolioItemEntity, ServiceItemEntity } from "./entities";

export class InMemoryDbContext {
  public services: ServiceItemEntity[] = [];
  public portfolio: PortfolioItemEntity[] = [];
  public orders: DesignOrderEntity[] = [];

  private nextId = 1;

  generateId(): number {
    return this.nextId++;
  }
}