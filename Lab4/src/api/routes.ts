import { Router } from "express";
import { getServices, createService, updateService, deleteService } from "./controllers/serviceController";
import { getPortfolio, createPortfolio, updatePortfolio, deletePortfolio } from "./controllers/portfolioController";
import { getOrders, createOrderFromCatalog, createTurnkeyOrder, updateOrder, deleteOrder } from "./controllers/orderController";

export const router = Router();

router.get("/services", getServices);
router.post("/services", createService);
router.put("/services/:id", updateService);
router.delete("/services/:id", deleteService);

router.get("/portfolio", getPortfolio);
router.post("/portfolio", createPortfolio);
router.put("/portfolio/:id", updatePortfolio);
router.delete("/portfolio/:id", deletePortfolio);

router.get("/orders", getOrders);
router.post("/orders/catalog", createOrderFromCatalog);
router.post("/orders/turnkey", createTurnkeyOrder);
router.put("/orders/:id", updateOrder);
router.delete("/orders/:id", deleteOrder);