import { Router } from "express";
import inventoryController from "../controllers/inventory/inventoryController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const inventoryRouter = new Router();

inventoryRouter.post('/', authMiddleware, inventoryController.create);
inventoryRouter.delete('/', authMiddleware, inventoryController.deleteInventories);
inventoryRouter.get('/user/:id', inventoryController.getAllCreated);
inventoryRouter.get('/available/:id', inventoryController.getAllAvailable);
inventoryRouter.get('/:id', inventoryController.getOne);
inventoryRouter.put('/:id/settings', authMiddleware, inventoryController.saveSettings);
inventoryRouter.put('/:id/favorite', authMiddleware, inventoryController.updateFavorite);
inventoryRouter.get('/:id/favorite/status', authMiddleware, inventoryController.checkFavorite);
inventoryRouter.get('/favorites/:userId', inventoryController.getFavoriteInventoriesByUser);

export default inventoryRouter;
