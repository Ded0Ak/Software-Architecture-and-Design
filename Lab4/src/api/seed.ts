import { container } from "./di/container";
import { TYPES } from "./di/types";
import { ServiceCatalogService, PortfolioService } from "../bll/services";
import { ServiceType } from "../dal/entities";

export function seedIfEmpty() {
  const services = container.get<ServiceCatalogService>(TYPES.ServiceCatalogService);
  const portfolio = container.get<PortfolioService>(TYPES.PortfolioService);

  if (services.getAll().length > 0 || portfolio.getAll().length > 0) return;

  services.addService("Дизайн інтерфейсу сайту", 1200, ServiceType.Regular);
  services.addService("Інтер'єрна концепція", 2500, ServiceType.Regular);
  services.addService("Брендинг під ключ", 5000, ServiceType.Turnkey);

  portfolio.addPortfolioItem("Modern Apartment", "Мінімалістичний інтер'єр");
}