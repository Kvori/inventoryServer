import lodash from 'lodash'
import getDeepDiff from '../../utils/diff.js'
import ApiError from '../../error/apiError.js'
import { Field, Inventory } from '../../models/models.js'
import { Op } from 'sequelize'
import sequelize from '../../db.js'

class FieldController {
    async save(req, res, next) {
        const { fields, inventoryId } = req.body

        if (!Array.isArray(fields)) {
            return next(ApiError.badRequest('Incorrect fields'))
        }

        const inventory = await Inventory.findOne({
            where: { id: inventoryId },
        })
        if (!inventory) {
            return next(ApiError.badRequest('Incorrect inventory id'))
        }

        const oldFields = await Field.findAll({ where: { inventoryId } })

        const deleteFieldIds = oldFields
            .filter((old) => !fields.find((f) => f.id === old.id))
            .map((f) => f.id)

        const newFields = fields.filter((field) => {
            if (field.newFlag) {
                delete field.newFlag
                delete field.id
                return true
            }
            return false
        })

        const changedFields = fields.filter((field) => !field.newFlag)
        const changedFieldsId = changedFields.map((field) => field.id)

        const searchedFields = await Field.findAll({
            where: { id: changedFieldsId },
        })

        const fieldsToUpdate = searchedFields
            .map((searched) => {
                const updated = changedFields.find((f) => f.id === searched.id)
                const diff = getDeepDiff(searched, updated) || {}
                return { field: searched, diff }
            })
            .filter(({ diff }) => Object.keys(diff).length > 0)

        const transaction = await sequelize.transaction()

        try {
            await Field.destroy({
                where: { id: { [Op.in]: deleteFieldIds } },
                transaction,
            })

            await Promise.all(
                newFields.map(async (field) => {
                    const created = await Field.create(field, { transaction })
                    await created.setInventory(inventory, { transaction })
                })
            )

            await Promise.all(
                fieldsToUpdate.map(({ field, diff }) =>
                    field.update(diff, { transaction })
                )
            )

            await transaction.commit()
            return res.json({ message: 'The fields have been saved.' })
        } catch (e) {
            await transaction.rollback()
            return next(ApiError.badRequest('Cant update these fields'))
        }
    }

    async create(req, res, next) {
        const { type, inventoryId } = req.body

        if (!type || !inventoryId) {
            return next(
                ApiError.badRequest('Invalid type or inventoryId parameters')
            )
        }

        try {
            const fieldsCount = await Field.findAll({ where: { inventoryId } })
            const newField = await Field.create({
                type,
                inventoryId,
                visible: 1,
                position: fieldsCount.length + 1,
            })
            newField.update({ title: `New field ${newField.id}` })
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
            const oldField = await Field.findOne({
                where: { id: fieldData.id, inventoryId },
            })

            if (!oldField) {
                return next(ApiError.badRequest('Such a field does not exist'))
            }

            const newField = await oldField.update(fieldData)

            return res.json(newField)
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
            const deletedCount = await Field.destroy({
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
        const sortedFields = req.body

        if (!sortedFields) {
            return next(
                ApiError.badRequest(
                    'Invalid sorted fields or inventory id parameters'
                )
            )
        }
        const transaction = await sequelize.transaction()

        try {
            const updatedFields = await Promise.all(
                sortedFields.map((field, index) =>
                    Field.update(
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

    async getAllInInventory(req, res, next) {
        const { id } = req.query

        if (!id) {
            return next(ApiError.badRequest('Invalid id parameters'))
        }

        try {
            const fields = await Field.findAll({
                where: { inventoryId: Number(id) },
            })
            return res.json(fields)
        } catch (e) {
            return next(ApiError.badRequest('Failed to get fields'))
        }
    }
}

const fieldController = new FieldController()

export default fieldController
