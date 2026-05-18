import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types";
import { InMemoryDbContext } from "../../dal/inMemoryDb";
import { UnitOfWork } from "../../dal/unitOfWork";
import { ServiceCatalogService, PortfolioService, DesignOrderService } from "../../bll/services";

const container = new Container();

container.bind<InMemoryDbContext>(TYPES.InMemoryDbContext).toConstantValue(
  new InMemoryDbContext("data/db.json")
);

container.bind<UnitOfWork>(TYPES.UnitOfWork).toDynamicValue(ctx => {
  const db = ctx.container.get<InMemoryDbContext>(TYPES.InMemoryDbContext);
  return new UnitOfWork(db);
});

container.bind<ServiceCatalogService>(TYPES.ServiceCatalogService).toDynamicValue(ctx => {
  const uow = ctx.container.get<UnitOfWork>(TYPES.UnitOfWork);
  return new ServiceCatalogService(uow);
});

container.bind<PortfolioService>(TYPES.PortfolioService).toDynamicValue(ctx => {
  const uow = ctx.container.get<UnitOfWork>(TYPES.UnitOfWork);
  return new PortfolioService(uow);
});

container.bind<DesignOrderService>(TYPES.DesignOrderService).toDynamicValue(ctx => {
  const uow = ctx.container.get<UnitOfWork>(TYPES.UnitOfWork);
  return new DesignOrderService(uow);
});

export { container };