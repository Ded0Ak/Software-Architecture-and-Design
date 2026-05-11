import { OrderType, ServiceType } from "../dal/entities";

export class ServiceItemDto {
  constructor(
    public id: number,
    public name: string,
    public price: number,
    public type: ServiceType
  ) {}
}

export class PortfolioItemDto {
  constructor(
    public id: number,
    public title: string,
    public description: string
  ) {}
}

export class DesignOrderDto {
  constructor(
    public id: number,
    public clientName: string,
    public orderType: OrderType,
    public serviceIds: number[],
    public totalPrice: number,
    public completed: boolean
  ) {}
}