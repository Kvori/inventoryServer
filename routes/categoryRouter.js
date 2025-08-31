import { Router } from "express";
import categoryController from "../controllers/inventory/categoryController.js"

const categoryRouter = new Router()

categoryRouter.post('/create', categoryController.create)
categoryRouter.get('/data', categoryController.getAll)

export default categoryRouter