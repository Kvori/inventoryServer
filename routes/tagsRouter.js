import { Router } from "express";
import tagsController from "../controllers/inventory/tagsController.js";

const tagsRouter = new Router()

tagsRouter.post('/create', tagsController.createTags)
tagsRouter.get('/filter', tagsController.getTagsBeginning)

export default tagsRouter