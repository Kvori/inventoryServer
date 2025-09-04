import { Router } from "express";
import fieldController from "../controllers/inventory/fieldController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const fieldRouter = new Router();

fieldRouter.get('/inventory/:inventoryId', fieldController.getFieldsByInventoryId);
fieldRouter.post('/', authMiddleware, fieldController.create);
fieldRouter.put('/positions', authMiddleware, fieldController.updatePositions);
fieldRouter.delete('/:id', authMiddleware, fieldController.delete);
fieldRouter.put('/:id', authMiddleware, fieldController.update);

export default fieldRouter;
