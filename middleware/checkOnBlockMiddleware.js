import jsonwebtoken from "jsonwebtoken"
import { User } from "../models/models.js"

async function checkOnBlockMiddleware(req, res, next) {
    const token = req.cookies.token
    if (!token) {
        return res.status(401).json({ message: "Пользователь не авторизован" })
    }

    const decoded = jsonwebtoken.verify(token, process.env.SECRET_KEY)
    const id = decoded.id
    const user = await User.findOne({ where: { id } })

    if (!user) return res.status(403).json({ message: "Ваш аккаунт был удалён" })
    if (user.block_status === 1) {
        return res.status(403).json({ message: "Вы заблокированы" })
    }
    req.id = id
    next()
}

export default checkOnBlockMiddleware
