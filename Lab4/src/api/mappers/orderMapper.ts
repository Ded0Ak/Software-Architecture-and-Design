import { DesignOrderDto } from "../../bll/dtos";
import { OrderResponse } from "../models/orderModels";

export const toOrderResponse = (dto: DesignOrderDto): OrderResponse => ({
  id: dto.id,
  clientName: dto.clientName,
  orderType: dto.orderType,
  serviceIds: dto.serviceIds,
  totalPrice: dto.totalPrice,
  completed: dto.completed
});