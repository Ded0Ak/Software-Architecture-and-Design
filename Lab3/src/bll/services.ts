import { IUnitOfWork } from "../dal/unitOfWork";
import { OrderType, ServiceType, DesignOrderEntity, ServiceItemEntity, PortfolioItemEntity } from "../dal/entities";
import { DesignOrderDto, ServiceItemDto, PortfolioItemDto } from "./dtos";
import { OrderMapper, ServiceMapper, PortfolioMapper } from "./mappers";
import { Validator } from "./validators";

export class ServiceCatalogService {
  constructor(private uow: IUnitOfWork) {}

  addService(name: string, price: number, type: ServiceType, id: number): ServiceItemDto {
    Validator.requireNonEmpty(name, "Назва послуги");
    Validator.requirePositive(price, "Ціна");

    if (this.uow.services.getAll().some(s => s.name.toLowerCase() === name.toLowerCase())) {
      throw new Error("Послуга з такою назвою вже існує");
    }

    const entity = new ServiceItemEntity(id, name, price, type);
    this.uow.services.add(entity);
    return ServiceMapper.toDto(entity);
  }

  getAll(): ServiceItemDto[] {
    return this.uow.services.getAll().map(ServiceMapper.toDto);
  }

  getByType(type: ServiceType): ServiceItemDto[] {
    return this.uow.services.getAll().filter(s => s.type === type).map(ServiceMapper.toDto);
  }

  searchByName(query: string): ServiceItemDto[] {
    return this.uow.services.getAll()
      .filter(s => s.name.toLowerCase().includes(query.toLowerCase()))
      .map(ServiceMapper.toDto);
  }
}

export class PortfolioService {
  constructor(private uow: IUnitOfWork) {}

  addPortfolioItem(title: string, description: string, id: number): PortfolioItemDto {
    Validator.requireNonEmpty(title, "Назва");
    Validator.requireNonEmpty(description, "Опис");

    const normalizedTitle = title.trim().toLowerCase();
    const normalizedDescription = description.trim().toLowerCase();
    const isDuplicate = this.uow.portfolio.getAll().some(p =>
      p.title.trim().toLowerCase() === normalizedTitle &&
      p.description.trim().toLowerCase() === normalizedDescription
    );
    if (isDuplicate) {
      throw new Error("Така робота вже є в портфоліо");
    }

    const entity = new PortfolioItemEntity(id, title, description);
    this.uow.portfolio.add(entity);
    return PortfolioMapper.toDto(entity);
  }

  getAll(): PortfolioItemDto[] {
    return this.uow.portfolio.getAll().map(PortfolioMapper.toDto);
  }
}

export class DesignOrderService {
  constructor(private uow: IUnitOfWork) {}

  createOrderFromCatalog(clientName: string, serviceIds: number[], id: number): DesignOrderDto {
    Validator.requireNonEmpty(clientName, "Ім'я клієнта");

    if (serviceIds.length === 0) throw new Error("Замовлення має містити хоча б одну послугу");

    const services = serviceIds
      .map(id => this.uow.services.getById(id))
      .filter((x): x is ServiceItemEntity => !!x);

    if (services.length !== serviceIds.length) {
      throw new Error("Деякі послуги не знайдено");
    }

    const total = services.reduce((sum, s) => sum + s.price, 0);

    const entity = new DesignOrderEntity(
      id,
      clientName,
      OrderType.FromCatalog,
      serviceIds,
      total,
      true
    );

    this.uow.orders.add(entity);
    return OrderMapper.toDto(entity);
  }

  createTurnkeyOrder(clientName: string, totalPrice: number, id: number): DesignOrderDto {
    Validator.requireNonEmpty(clientName, "Ім'я клієнта");
    Validator.requirePositive(totalPrice, "Сума замовлення");

    const entity = new DesignOrderEntity(
      id,
      clientName,
      OrderType.Turnkey,
      [],
      totalPrice,
      true
    );

    this.uow.orders.add(entity);
    return OrderMapper.toDto(entity);
  }

  getAll(): DesignOrderDto[] {
    return this.uow.orders.getAll().map(OrderMapper.toDto);
  }
}