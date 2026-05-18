export enum ServiceType {
  Regular = "Regular",
  Turnkey = "Turnkey"
}

export class ServiceItemEntity {
  constructor(
    public id: number,
    public name: string,
    public price: number,
    public type: ServiceType
  ) {}
}

export class PortfolioItemEntity {
  constructor(
    public id: number,
    public title: string,
    public description: string
  ) {}
}

export enum OrderType {
  FromCatalog = "FromCatalog",
  Turnkey = "Turnkey"
}

export class DesignOrderEntity {
  constructor(
    public id: number,
    public clientName: string,
    public orderType: OrderType,
    public serviceIds: number[],
    public totalPrice: number,
    public completed: boolean
  ) {}
}