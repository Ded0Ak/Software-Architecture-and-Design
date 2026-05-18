import { Request, Response } from "express";
import { container } from "../di/container";
import { TYPES } from "../di/types";
import { PortfolioService } from "../../bll/services";
import { toPortfolioResponse } from "../mappers/portfolioMapper";
import { CreatePortfolioRequest } from "../models/portfolioModels";

const service = container.get<PortfolioService>(TYPES.PortfolioService);

export const getPortfolio = (req: Request, res: Response) => {
  const data = service.getAll();
  res.json(data.map(toPortfolioResponse));
};

export const createPortfolio = (req: Request, res: Response) => {
  try {
    const body: CreatePortfolioRequest = req.body;
    const item = service.addPortfolioItem(body.title, body.description);
    res.status(201).json(toPortfolioResponse(item));
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const updatePortfolio = (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const body: CreatePortfolioRequest = req.body;
    const item = service.updatePortfolioItem(id, body.title, body.description);
    res.json(toPortfolioResponse(item));
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const deletePortfolio = (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    service.deletePortfolioItem(id);
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};