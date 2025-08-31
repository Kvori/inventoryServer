import ApiError from '../../error/apiError.js'
import { Category, Inventory, Tag, User } from '../../models/models.js'
import getDeepDiff from '../../utils/diff.js'
import { Op } from 'sequelize'

class InventoryController {
    async create(req, res, next) {
        const userId = req.body.userId

        const inventoriesLength = await Inventory.findAll({
            where: { userId: userId },
        })

        const [user, category, inventory] = await Promise.all([
            User.findOne({ where: { id: userId } }),
            Category.findOne(),
            Inventory.create({
                title: `New inventory${inventoriesLength.length > 0
                    ? ` ${inventoriesLength.length + 1}`
                    : '1'
                    }`,
            }),
        ])

        if (!user || !category || !inventory) {
            return next(
                ApiError.badRequest('Incorrect user, category or inventory')
            )
        }

        try {
            await Promise.all([
                inventory.setUser(user),
                inventory.setCategory(category),
            ])
            return res.json(inventory)
        } catch (e) {
            return next(ApiError.badRequest('Cant create inventory'))
        }
    }

    async getOne(req, res, next) {
        const id = req.query.id

        const inventory = await Inventory.findOne({
            where: { id: id },
            include: [{
                model: Tag,
                attributes: ['title'],
                through: { attributes: [] }
            }]
        })

        return res.json(inventory)
    }

    async getAllByUser(req, res, next) {
        const id = req.query.id

        const inventories = await Inventory.findAll({ where: { userId: id } })
        return res.json(inventories)
    }

    async saveSettings(req, res, next) {
        const { inventory, tags } = req.body

        if (!inventory || !tags) {
            return next(ApiError.badRequest('Incorrect invenory data or tags'))
        }

        const oldInventory = await Inventory.findOne({
            where: { id: inventory.id }
        })

        if (!oldInventory) {
            return next(ApiError.internal('Inventory does not exist'))
        }

        const diff = getDeepDiff(oldInventory, inventory)
        const updatedInventory = await oldInventory.update(diff)
        
        await Tag.bulkCreate(tags, { ignoreDuplicates: true })

        const savedTags = await Tag.findAll({
            where: {
                title: {
                    [Op.in]: tags.map(tag => tag.title)
                }
            }
        })

        if (savedTags) {
            await updatedInventory.setTags(savedTags)
        }

        return res.json({ updatedInventory })
    }
}

const inventoryController = new InventoryController()

export default inventoryController
