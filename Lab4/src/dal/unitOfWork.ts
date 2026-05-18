import { Repository } from "./repository";
import { InMemoryDbContext } from "./inMemoryDb";
import { DesignOrderEntity, PortfolioItemEntity, ServiceItemEntity } from "./entities";

export interface IUnitOfWork {
  services: Repository<ServiceItemEntity>;
  portfolio: Repository<PortfolioItemEntity>;
  orders: Repository<DesignOrderEntity>;
  saveChanges(): void;

  generateServiceId(): number;
  generatePortfolioId(): number;
  generateOrderId(): number;
}

export class UnitOfWork implements IUnitOfWork {
  public services: Repository<ServiceItemEntity>;
  public portfolio: Repository<PortfolioItemEntity>;
  public orders: Repository<DesignOrderEntity>;

  constructor(public context: InMemoryDbContext) {
    this.services = new Repository<ServiceItemEntity>(context.services);
    this.portfolio = new Repository<PortfolioItemEntity>(context.portfolio);
    this.orders = new Repository<DesignOrderEntity>(context.orders);
  }

  saveChanges(): void {
    this.context.saveToFile();
  }

  generateServiceId(): number {
    return this.context.generateServiceId();
  }

  generatePortfolioId(): number {
    return this.context.generatePortfolioId();
  }

  generateOrderId(): number {
    return this.context.generateOrderId();
  }
}