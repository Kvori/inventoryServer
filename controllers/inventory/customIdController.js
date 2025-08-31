import ApiError from '../../error/apiError.js'
import { CustomId } from '../../models/models.js'
import sequelize from '../../db.js'

class CustomIdController {
    async create(req, res, next) {
        const { type, inventoryId } = req.body

        if (!type || !inventoryId) {
            return next(
                ApiError.badRequest('Invalid type or inventoryId parameters')
            )
        }

        try {
            const fieldsCount = await CustomId.findAll({ where: { inventoryId } })
            const newField = await CustomId.create({
                type,
                inventoryId,
                position: fieldsCount.length + 1,
            })

            return res.json(newField)
        } catch (e) {
            return next(ApiError.internal('Failed to create new field'))
        }
    }

    async update(req, res, next) {
        const { fieldData, inventoryId } = req.body

        if (!fieldData || !inventoryId) {
            return next(
                ApiError.badRequest('Invalid field or inventoryId parameters')
            )
        }

        try {
            const oldField = await CustomId.findOne({
                where: { id: fieldData.id, inventoryId },
            })

            if (!oldField) {
                return next(ApiError.badRequest('Such a field does not exist'))
            }

            const updatedField = await oldField.update(fieldData)

            return res.json(updatedField)
        } catch (e) {
            return next(ApiError.internal('Failed to update field'))
        }
    }

    async delete(req, res, next) {
        const { fieldId, inventoryId } = req.body

        if (!fieldId || !inventoryId) {
            return next(
                ApiError.badRequest('Invalid field or inventoryId parameters')
            )
        }

        try {
            const deletedCount = await CustomId.destroy({
                where: { id: fieldId, inventoryId },
            })

            if (deletedCount === 0) {
                return next(
                    ApiError.badRequest(
                        'Field not found or does not belong to inventory'
                    )
                )
            }

            return res.json({ message: 'Field deleted' })
        } catch (e) {
            return next(ApiError.internal('Failed to delete field'))
        }
    }

    async updatePositions(req, res, next) {
        const sortedFilds = req.body

        if (!sortedFilds) {
            return next(
                ApiError.badRequest(
                    'Invalid sorted fields or inventory id parameters'
                )
            )
        }
        const transaction = await sequelize.transaction()

        try {
            const updatedFields = await Promise.all(
                sortedFilds.map((field, index) =>
                    CustomId.update(
                        { position: index + 1 },
                        { where: { id: field.id }, transaction }
                    )
                )
            )
            await transaction.commit()
            return res.json(updatedFields)
        } catch (e) {
            await transaction.rollback()
            return next(ApiError.internal('Failed to update fields positions'))
        }
    }

    async getAllInventory(req, res, next) {
        const { id } = req.query

        if (!id) {
            return next(ApiError.badRequest('Invalid id parameters'))
        }

        try {
            const fields = await CustomId.findAll({
                where: { inventoryId: Number(id) },
            })
            return res.json(fields)
        } catch (e) {
            return next(ApiError.badRequest('Failed to get fields'))
        }
    }
}

const customIdController = new CustomIdController()

export default customIdController
