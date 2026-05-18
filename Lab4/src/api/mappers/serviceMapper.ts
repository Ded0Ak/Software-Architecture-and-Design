import { ServiceItemDto } from "../../bll/dtos";
import { ServiceResponse } from "../models/serviceModels";

export const toServiceResponse = (dto: ServiceItemDto): ServiceResponse => ({
  id: dto.id,
  name: dto.name,
  price: dto.price,
  type: dto.type
});