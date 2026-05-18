import { Request, Response } from "express";
import { container } from "../di/container";
import { TYPES } from "../di/types";
import { ServiceCatalogService } from "../../bll/services";
import { toServiceResponse } from "../mappers/serviceMapper";
import { CreateServiceRequest } from "../models/serviceModels";
import { ServiceType } from "../../dal/entities";

const service = container.get<ServiceCatalogService>(TYPES.ServiceCatalogService);

export const getServices = (req: Request, res: Response) => {
  const type = req.query.type as string | undefined;
  const data = type
    ? service.getByType(type === "Turnkey" ? ServiceType.Turnkey : ServiceType.Regular)
    : service.getAll();
  res.json(data.map(toServiceResponse));
};

export const createService = (req: Request, res: Response) => {
  try {
    const body: CreateServiceRequest = req.body;
    const item = service.addService(
      body.name,
      body.price,
      body.type === "Turnkey" ? ServiceType.Turnkey : ServiceType.Regular
    );
    res.status(201).json(toServiceResponse(item));
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const updateService = (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const body: CreateServiceRequest = req.body;
    const item = service.updateService(
      id,
      body.name,
      body.price,
      body.type === "Turnkey" ? ServiceType.Turnkey : ServiceType.Regular
    );
    res.json(toServiceResponse(item));
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const deleteService = (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    service.deleteService(id);
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};