import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import userController from "../controllers/userController.js"; 
import checkOnBlockMiddleware from "../middleware/checkOnBlockMiddleware.js";

const userRouter = new Router()

userRouter.post('/registration', userController.registration)
userRouter.post('/login', userController.login)
userRouter.post('/logout', authMiddleware, userController.logout)
userRouter.get('/auth', authMiddleware, userController.check)
userRouter.get('/data', userController.getAll)
userRouter.get('/user', authMiddleware, userController.getOne)
userRouter.get('/block', checkOnBlockMiddleware, userController.block)
userRouter.get('/unblock', checkOnBlockMiddleware, userController.unblock)
userRouter.delete('/delete', checkOnBlockMiddleware, userController.delete)

export default userRouter