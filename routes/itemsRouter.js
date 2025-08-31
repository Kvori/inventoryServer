import { Router } from "express";
import itemController from "../controllers/inventory/itemController.js";
import authMiddleware from "../middleware/authMiddleware.js"

const itemsRouter = new Router()

itemsRouter.post('/create', authMiddleware, itemController.create)
itemsRouter.delete('/delete', itemController.delete)
itemsRouter.get('/inventory', itemController.getAllByInventoryId)
itemsRouter.get('/item', itemController.getOneByItemId)
itemsRouter.put('/update', itemController.update)

export default itemsRouter