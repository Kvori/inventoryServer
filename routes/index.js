import { Router } from "express";
import userRouter from "./userRouter.js";
import inventoryRouter from "./inventoryRouter.js";
import fieldRouter from "./fieldRouter.js";
import categoryRouter from "./categoryRouter.js";
import tagsRouter from "./tagsRouter.js";
import itemsRouter from "./itemsRouter.js"
import customIdRouter from "./custoimIdRoutes.js";

const router = new Router()

router.use('/users', userRouter)
router.use('/inventories', inventoryRouter)
router.use('/fields', fieldRouter)
router.use('/categories', categoryRouter)
router.use('/tags', tagsRouter)
router.use('/items', itemsRouter)
router.use('/customId', customIdRouter)

export default router