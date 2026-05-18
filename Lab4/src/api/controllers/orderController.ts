import { Request, Response } from "express";
import { container } from "../di/container";
import { TYPES } from "../di/types";
import { DesignOrderService } from "../../bll/services";
import { toOrderResponse } from "../mappers/orderMapper";
import { CreateOrderFromCatalogRequest, CreateTurnkeyOrderRequest, UpdateOrderRequest } from "../models/orderModels";
import { OrderType } from "../../dal/entities";

const service = container.get<DesignOrderService>(TYPES.DesignOrderService);

export const getOrders = (req: Request, res: Response) => {
  const data = service.getAll();
  res.json(data.map(toOrderResponse));
};

export const createOrderFromCatalog = (req: Request, res: Response) => {
  try {
    const body: CreateOrderFromCatalogRequest = req.body;
    const item = service.createOrderFromCatalog(body.clientName, body.serviceIds);
    res.status(201).json(toOrderResponse(item));
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const createTurnkeyOrder = (req: Request, res: Response) => {
  try {
    const body: CreateTurnkeyOrderRequest = req.body;
    const item = service.createTurnkeyOrder(body.clientName, body.totalPrice);
    res.status(201).json(toOrderResponse(item));
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const updateOrder = (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const body: UpdateOrderRequest = req.body;
    const orderType = body.orderType === "Turnkey" ? OrderType.Turnkey : OrderType.FromCatalog;

    const item = service.updateOrder(
      id,
      body.clientName,
      orderType,
      body.serviceIds ?? null,
      body.totalPrice ?? null
    );

    res.json(toOrderResponse(item));
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const deleteOrder = (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    service.deleteOrder(id);
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};