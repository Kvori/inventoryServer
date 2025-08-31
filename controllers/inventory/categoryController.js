import { Category } from '../../models/models.js'
import ApiError from '../../error/apiError.js'

class CategoryController {
    async create(req, res, next) {
        const title = req.body.title

        const condidate = await Category.findOne({ where: { title: title } })

        if (condidate) {
            return next(ApiError.badRequest('A category with this name already exists'))
        }

        try {
            const category = await Category.create({ title })
            res.json(category)
        } catch (e) {
            return next(ApiError.badRequest('Cant create new category'))
        }
    }

    async getAll(req, res, next) {
        try {
            const categories = await Category.findAll()
            return res.json(categories)
        } catch (e) {
            return next(ApiError.badRequest('Cant get categories'))
        }
    }
}

const categoryController = new CategoryController()

export default categoryController