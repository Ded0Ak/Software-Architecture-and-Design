import { IUnitOfWork } from "../dal/unitOfWork";
import { OrderType, ServiceType, DesignOrderEntity, ServiceItemEntity, PortfolioItemEntity } from "../dal/entities";
import { DesignOrderDto, ServiceItemDto, PortfolioItemDto } from "./dtos";
import { OrderMapper, ServiceMapper, PortfolioMapper } from "./mappers";
import { Validator } from "./validators";

export class ServiceCatalogService {
  constructor(private uow: IUnitOfWork) {}

  addService(name: string, price: number, type: ServiceType): ServiceItemDto {
    Validator.requireNonEmpty(name, "Service name");
    Validator.requirePositive(price, "Price");

    const exists = this.uow.services.getAll().some(s =>
      s.name.toLowerCase() === name.toLowerCase() && s.type === type
    );
    if (exists) throw new Error("Послуга з такою назвою та типом уже існує");

    const entity = new ServiceItemEntity(this.uow.generateServiceId(), name, price, type);
    this.uow.services.add(entity);
    this.uow.saveChanges();
    return ServiceMapper.toDto(entity);
  }

  updateService(id: number, name: string, price: number, type: ServiceType): ServiceItemDto {
    Validator.requireNonEmpty(name, "Service name");
    Validator.requirePositive(price, "Price");

    const exists = this.uow.services.getAll().some(s =>
      s.id !== id && s.name.toLowerCase() === name.toLowerCase() && s.type === type
    );
    if (exists) throw new Error("Послуга з такою назвою та типом уже існує");

    const entity = new ServiceItemEntity(id, name, price, type);
    this.uow.services.update(entity);
    this.uow.saveChanges();
    return ServiceMapper.toDto(entity);
  }

  deleteService(id: number): void {
    this.uow.services.delete(id);
    this.uow.saveChanges();
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

  addPortfolioItem(title: string, description: string): PortfolioItemDto {
    Validator.requireNonEmpty(title, "Title");
    Validator.requireNonEmpty(description, "Description");

    const exists = this.uow.portfolio.getAll().some(p =>
      p.title.toLowerCase() === title.toLowerCase()
    );
    if (exists) throw new Error("Елемент портфоліо з цією назвою вже існує");

    const entity = new PortfolioItemEntity(this.uow.generatePortfolioId(), title, description);
    this.uow.portfolio.add(entity);
    this.uow.saveChanges();
    return PortfolioMapper.toDto(entity);
  }

  updatePortfolioItem(id: number, title: string, description: string): PortfolioItemDto {
    Validator.requireNonEmpty(title, "Title");
    Validator.requireNonEmpty(description, "Description");

    const exists = this.uow.portfolio.getAll().some(p =>
      p.id !== id && p.title.toLowerCase() === title.toLowerCase()
    );
    if (exists) throw new Error("Елемент портфоліо з цією назвою вже існує");

    const entity = new PortfolioItemEntity(id, title, description);
    this.uow.portfolio.update(entity);
    this.uow.saveChanges();
    return PortfolioMapper.toDto(entity);
  }

  deletePortfolioItem(id: number): void {
    this.uow.portfolio.delete(id);
    this.uow.saveChanges();
  }

  getAll(): PortfolioItemDto[] {
    return this.uow.portfolio.getAll().map(PortfolioMapper.toDto);
  }
}

export class DesignOrderService {
  constructor(private uow: IUnitOfWork) {}

  createOrderFromCatalog(clientName: string, serviceIds: number[]): DesignOrderDto {
    Validator.requireNonEmpty(clientName, "Client name");
    if (serviceIds.length === 0) throw new Error("Замовлення має містити щонайменше одну послугу");

    const services = serviceIds
      .map(id => this.uow.services.getById(id))
      .filter((x): x is ServiceItemEntity => !!x);

    if (services.length !== serviceIds.length) throw new Error("Деякі послуги не знайдено");

    const total = services.reduce((sum, s) => sum + s.price, 0);

    const entity = new DesignOrderEntity(
      this.uow.generateOrderId(),
      clientName,
      OrderType.FromCatalog,
      serviceIds,
      total,
      true
    );

    this.uow.orders.add(entity);

    const portfolioItem = new PortfolioItemEntity(
      this.uow.generatePortfolioId(),
      `Замовлення #${entity.id}`,
      `Виконано для ${entity.clientName}`
    );
    this.uow.portfolio.add(portfolioItem);

    this.uow.saveChanges();
    return OrderMapper.toDto(entity);
  }

  createTurnkeyOrder(clientName: string, totalPrice: number): DesignOrderDto {
    Validator.requireNonEmpty(clientName, "Client name");
    Validator.requirePositive(totalPrice, "Total price");

    const entity = new DesignOrderEntity(
      this.uow.generateOrderId(),
      clientName,
      OrderType.Turnkey,
      [],
      totalPrice,
      true
    );

    this.uow.orders.add(entity);

    const portfolioItem = new PortfolioItemEntity(
      this.uow.generatePortfolioId(),
      `Під ключ #${entity.id}`,
      `Виконано для ${entity.clientName}`
    );
    this.uow.portfolio.add(portfolioItem);

    this.uow.saveChanges();
    return OrderMapper.toDto(entity);
  }

  updateOrder(id: number, clientName: string, orderType: OrderType, serviceIds: number[] | null, totalPrice: number | null): DesignOrderDto {
    Validator.requireNonEmpty(clientName, "Client name");

    if (orderType === OrderType.FromCatalog) {
      if (!serviceIds || serviceIds.length === 0) throw new Error("Замовлення має містити щонайменше одну послугу");

      const services = serviceIds
        .map(sid => this.uow.services.getById(sid))
        .filter((x): x is ServiceItemEntity => !!x);

      if (services.length !== serviceIds.length) throw new Error("Деякі послуги не знайдено");

      const total = services.reduce((sum, s) => sum + s.price, 0);

      const entity = new DesignOrderEntity(id, clientName, orderType, serviceIds, total, true);
      this.uow.orders.update(entity);

      this.syncPortfolioForOrder(id, OrderType.FromCatalog, clientName);

      this.uow.saveChanges();
      return OrderMapper.toDto(entity);
    }

    if (totalPrice === null || totalPrice <= 0) throw new Error("Загальна сума повинна бути додатною");

    const entity = new DesignOrderEntity(id, clientName, orderType, [], totalPrice, true);
    this.uow.orders.update(entity);

    this.syncPortfolioForOrder(id, OrderType.Turnkey, clientName);

    this.uow.saveChanges();
    return OrderMapper.toDto(entity);
  }

  deleteOrder(id: number): void {
    const toDelete = this.uow.portfolio.getAll().filter(p =>
      p.title === `Замовлення #${id}` || p.title === `Під ключ #${id}`
    );
    toDelete.forEach(p => this.uow.portfolio.delete(p.id));

    this.uow.orders.delete(id);
    this.uow.saveChanges();
  }

  getAll(): DesignOrderDto[] {
    return this.uow.orders.getAll().map(OrderMapper.toDto);
  }

  private syncPortfolioForOrder(orderId: number, orderType: OrderType, clientName: string) {
    const titles = [`Замовлення #${orderId}`, `Під ключ #${orderId}`];
    const existing = this.uow.portfolio.getAll().find(p => titles.includes(p.title));

    const newTitle = orderType === OrderType.FromCatalog
      ? `Замовлення #${orderId}`
      : `Під ключ #${orderId}`;

    if (existing) {
      const updated = new PortfolioItemEntity(existing.id, newTitle, `Виконано для ${clientName}`);
      this.uow.portfolio.update(updated);
    } else {
      const created = new PortfolioItemEntity(
        this.uow.generatePortfolioId(),
        newTitle,
        `Виконано для ${clientName}`
      );
      this.uow.portfolio.add(created);
    }
  }
}