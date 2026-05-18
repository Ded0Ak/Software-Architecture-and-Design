import { DesignOrderEntity, PortfolioItemEntity, ServiceItemEntity } from "./entities";
import * as fs from "fs";
import * as path from "path";

export class InMemoryDbContext {
  public services: ServiceItemEntity[] = [];
  public portfolio: PortfolioItemEntity[] = [];
  public orders: DesignOrderEntity[] = [];

  private serviceIdCounter = 1;
  private portfolioIdCounter = 1;
  private orderIdCounter = 1;

  constructor(private filePath: string) {
    this.loadFromFile();
  }

  generateServiceId(): number {
    return this.serviceIdCounter++;
  }

  generatePortfolioId(): number {
    return this.portfolioIdCounter++;
  }

  generateOrderId(): number {
    return this.orderIdCounter++;
  }

  private loadFromFile(): void {
    if (!fs.existsSync(this.filePath)) return;

    const raw = fs.readFileSync(this.filePath, "utf8");
    if (!raw) return;

    const data = JSON.parse(raw);

    this.services = data.services || [];
    this.portfolio = data.portfolio || [];
    this.orders = data.orders || [];

    this.serviceIdCounter = (this.services.reduce((max, s) => Math.max(max, s.id), 0) || 0) + 1;
    this.portfolioIdCounter = (this.portfolio.reduce((max, p) => Math.max(max, p.id), 0) || 0) + 1;
    this.orderIdCounter = (this.orders.reduce((max, o) => Math.max(max, o.id), 0) || 0) + 1;
  }

  saveToFile(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const data = {
      services: this.services,
      portfolio: this.portfolio,
      orders: this.orders
    };
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf8");
  }
}