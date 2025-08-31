import { Router } from "express";
import fieldController from "../controllers/inventory/fieldController.js"
import authMiddleware from "../middleware/authMiddleware.js"

const fieldRouter = new Router()

fieldRouter.put('/save', authMiddleware, fieldController.save)
fieldRouter.post('/create', authMiddleware, fieldController.create)
fieldRouter.put('/update', authMiddleware, fieldController.update)
fieldRouter.delete('/delete', authMiddleware, fieldController.delete)
fieldRouter.put('/positions', authMiddleware, fieldController.updatePositions)
fieldRouter.get('/data', fieldController.getAllInInventory)

export default fieldRouter