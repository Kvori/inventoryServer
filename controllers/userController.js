import ApiError from "../error/apiError.js"
import bcrypt from 'bcrypt'
import { User } from "../models/models.js"

class UserController {
    async registration(req, res, next) {
        try {
            const { email, name, password } = req.body
            if (!email || !password || !name) {
                return next(ApiError.badRequest('Некорретный email, имя или пароль'))
            }

            const candidate = await User.findOne({ where: { email } })
            if (candidate) {
                return next(ApiError.badRequest('Пользователь с таким email уже существует'))
            }

            const hashPassword = await bcrypt.hash(password, 5)
            const user = await User.create({ email, name, password: hashPassword })

            await user.update({ last_login: new Date() })

            req.session.user = {
                id: user.id,
                email: user.email,
                name: user.name
            }

            req.session.save(() => {
                return res.json(user)
            })
        } catch (e) {
            next(ApiError.internal('Ошибка регистрации'))
        }
    }

    async login(req, res, next) {
        const { email, password } = req.body

        try {
            const user = await User.findOne({ where: { email } })
            if (!user) {
                return next(ApiError.badRequest('Пользователя не найден'))
            }

            const comparePassword = bcrypt.compareSync(password, user.password)
            if (!comparePassword) {
                return next(ApiError.badRequest('Неверный пароль'))
            }

            if (user.block_status === 1) {
                return next(ApiError.forbidden('Пользователь заблокирован'))
            }

            await user.update({ last_login: new Date() })

            req.session.user = {
                id: user.id,
                email: user.email,
                name: user.name
            }

            req.session.save(() => {
                return res.json(user)
            })
        } catch (e) {
            next(ApiError.internal('Ошибка входа'))
        }
    }

    async check(req, res) {
        try {
            const sessionUser = req.session?.user

            if (!sessionUser) {
                return res.status(401).json({ message: "Сессия не найдена" })
            }

            const id = sessionUser.id
            const user = await User.findOne({
                where: { id },
                attributes: ["id", "name", "email", "last_login", "block_status"]
            })

            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' })
            }

            await user.update({ last_login: new Date() })

            req.session.user = {
                id: user.id,
                email: user.email,
                name: user.name
            }

            return res.json(user)
        } catch (e) {
            next(ApiError.internal('Ошибка при проверке сессии'))
        }
    }

    async logout(req, res, next) {
        const session = req.session

        if (!session) {
            return res.status(401).json({ message: "Сессия не найдена" })
        }

        session.destroy(err => {
            if (err) {
                return next(ApiError.internal('Ошибка при выходе из системы'))
            }

            res.clearCookie('connect.sid', {
                path: '/',
                httpOnly: true,
                sameSite: 'none',
                secure: true
            })
            res.json({ message: 'Выход из системы прошел успешно' })
        })
    }

    async block(req, res, next) {
        const ids = [...[req.query.id]].flat()
        const numericIds = ids.map(Number);
        const blockComplete = await User.update({ block_status: 1 }, { where: { id: numericIds } })

        if (ids.includes(String(req.id))) return next(ApiError.forbidden('Вы заблокированы'))

        return res.json({ message: `Пользователи в количестве=${blockComplete} заблокированы` })
    }

    async unblock(req, res, next) {
        const ids = [...[req.query.id]].flat()
        const numericIds = ids.map(Number);
        const blockComplete = await User.update({ block_status: 0 }, { where: { id: numericIds } })

        return res.json({ message: `Пользователи в количестве=${blockComplete} разблокированы` })
    }

    async delete(req, res, next) {
        const ids = [...[req.query.id]].flat()
        const numericIds = ids.map(Number);
        const deleteComplete = await User.destroy({ where: { id: numericIds } })

        if (ids.includes(String(req.id))) return next(ApiError.forbidden('Ваш аккаунт был удалён'))

        return res.json({ message: `Пользователи в количестве=${deleteComplete} удалены` })
    }

    async getAll(req, res) {
        const users = await User.findAll({ attributes: ["id", "name", "email", "last_login", "block_status"] })
        return res.json({ users })
    }

    async getOne(req, res, next) {
        const id = req.query.id
        const user = await User.findOne({ where: { id: id }, attributes: ["id", "name", "email", "last_login", "block_status"] })

        if (!user) {
            return next(ApiError.badRequest('Such user does not exist'))
        }
        return res.json(user)
    }
}

const userController = new UserController()

export default userController