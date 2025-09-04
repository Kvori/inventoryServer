import sequelize from '../../db.js'
import ApiError from '../../error/apiError.js'
import { Item, ItemValue, User } from '../../models/models.js'

class ItemController {
    async create(req, res, next) {
        const { inventoryId, itemValues } = req.body

        if (!inventoryId || !itemValues) {
            return next(
                ApiError.badRequest('Incorrect inventory id or iteams value')
            )
        }

        const user = req.user
        const transaction = await sequelize.transaction()

        try {
            const newItemValues = await ItemValue.bulkCreate(itemValues, {
                transaction,
            })

            const candidate = await User.findOne({where: {id: user.id}})

            if (!candidate) {
                return next(ApiError.internal('Failed to get creator'))
            }

            const newItem = await Item.create(
                { inventoryId: inventoryId, creatorId: user.id },
                { transaction }
            )
            const promise = await Promise.all(
                newItemValues.map((itemValue) =>
                    itemValue.setItem(newItem, { transaction })
                )
            )

            await transaction.commit()
            return res.json(promise)
        } catch (e) {
            await transaction.rollback()
            return next(ApiError.badRequest('Cant create new item'))
        }
    }

    async delete(req, res, next) {
        const itemId = req.query.id

        if (!itemId) {
            return next(ApiError.badRequest('Incorrect item id'))
        }

        try {
            await Item.destroy({ where: { id: itemId } })
            return res.json({ message: 'Item deleted' })
        } catch (e) {
            return next(ApiError.internal('Failed to delete item'))
        }
    }

    async update(req, res, next) {
        const { itemValues, itemId } = req.body

        if (!itemValues) {
            return next(
                ApiError.badRequest('Incorrect iteam values')
            )
        }

        const transaction = await sequelize.transaction()

        try {
            const promise = await Promise.all(
                itemValues.map(async (itemValue) => {
                    const item = await ItemValue.findOne({ where: { itemId, fieldId: itemValue.fieldId } })
                    if (!item) {
                        return ItemValue.create({ ...itemValue, itemId })
                    } else {
                        return ItemValue.update({ value: itemValue.value }, { where: { itemId, fieldId: itemValue.fieldId }, transaction })
                    }
                })
            )

            await transaction.commit()
            return res.json(promise)
        } catch (e) {
            await transaction.rollback()
            return next(ApiError.badRequest('Cant update item'))
        }
    }

    async getAllByInventoryId(req, res, next) {
        const inventoryId = req.query.inventoryId

        try {
            const items = await Item.findAll({
                where: { inventoryId },
                include: [
                    {
                        model: ItemValue,
                        attributes: ['id', 'value', 'fieldId'],
                    },
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['name']
                    }
                ]
            })

            const formatted = items.map(item => ({
                id: item.id,
                creator: item.creator?.name || null,
                createdAt: item.createdAt,
                itemValues: item.itemValues
            }))

            return res.json(formatted)
        } catch (e) {
            return next(ApiError.internal('Failed to get item'))
        }
    }

    async getOneByItemId(req, res, next) {
        const itemId = req.query.itemId

        try {
            const item = await Item.findOne({
                where: { id: itemId },
                include: [
                    {
                        model: ItemValue,
                        attributes: ['id', 'value', 'fieldId'],
                    },
                ],
            })

            return res.json(item)
        } catch (e) {
            return next(ApiError.internal('Failed to get items'))
        }
    }
}

const itemController = new ItemController()

export default itemController
