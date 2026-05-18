import { PortfolioItemDto } from "../../bll/dtos";
import { PortfolioResponse } from "../models/portfolioModels";

export const toPortfolioResponse = (dto: PortfolioItemDto): PortfolioResponse => ({
  id: dto.id,
  title: dto.title,
  description: dto.description
});