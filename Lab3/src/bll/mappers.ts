import { DesignOrderDto, PortfolioItemDto, ServiceItemDto } from "./dtos";
import { DesignOrderEntity, PortfolioItemEntity, ServiceItemEntity } from "../dal/entities";

export class ServiceMapper {
  static toDto(e: ServiceItemEntity): ServiceItemDto {
    return new ServiceItemDto(e.id, e.name, e.price, e.type);
  }
}

export class PortfolioMapper {
  static toDto(e: PortfolioItemEntity): PortfolioItemDto {
    return new PortfolioItemDto(e.id, e.title, e.description);
  }
}

export class OrderMapper {
  static toDto(e: DesignOrderEntity): DesignOrderDto {
    return new DesignOrderDto(
      e.id,
      e.clientName,
      e.orderType,
      e.serviceIds,
      e.totalPrice,
      e.completed
    );
  }
}