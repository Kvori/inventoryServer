import { Router } from "express";
import inventoryController from "../controllers/inventory/inventoryController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const inventoryRouter = new Router()

inventoryRouter.post('/create', authMiddleware, inventoryController.create)
inventoryRouter.get('/user', authMiddleware, inventoryController.getAllByUser)
inventoryRouter.get('/inventory', inventoryController.getOne)
inventoryRouter.post('/save', authMiddleware, inventoryController.saveSettings)

export default inventoryRouter