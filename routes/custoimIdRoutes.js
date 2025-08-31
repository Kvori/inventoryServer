import { Router } from "express";
import customIdController from "../controllers/inventory/customIdController.js"
import authMiddleware from "../middleware/authMiddleware.js"

const customIdRouter = new Router()

customIdRouter.post('/create', authMiddleware, customIdController.create)
customIdRouter.post('/update', authMiddleware, customIdController.update)
customIdRouter.post('/delete', authMiddleware, customIdController.delete)
customIdRouter.post('/positions', authMiddleware, customIdController.updatePositions)
customIdRouter.get('/data', customIdController.getAllInventory)

export default customIdRouter