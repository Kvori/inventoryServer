import ApiError from '../../error/apiError.js'
import { Field } from '../../models/models.js'
import sequelize from '../../db.js'

class FieldController {
    async getFieldsByInventoryId(req, res, next) {
        const inventoryId = req.params.inventoryId;

        if (!inventoryId) {
            return next(ApiError.badRequest('Missing inventoryId'));
        }

        try {
            const fields = await Field.findAll({
                where: { inventoryId: Number(inventoryId) },
            });
            return res.json(fields);
        } catch (e) {
            return next(ApiError.internal('Failed to fetch fields'));
        }
    }

    async create(req, res, next) {
        const { type, inventoryId } = req.body;

        if (!type || !inventoryId) {
            return next(ApiError.badRequest('Missing type or inventoryId'));
        }

        const fieldsTypeLimit = 3
        const fieldsType = await Field.findAll({where: {inventoryId, type}})
        
        if (fieldsType.length >= fieldsTypeLimit) {
            return next(ApiError.badRequest('Fields type limit exceeded'))
        }

        try {
            const fieldsCount = await Field.count({ where: { inventoryId } });
            const newField = await Field.create({
                type,
                inventoryId,
                visible: 1,
                position: fieldsCount + 1,
                title: `New field ${fieldsCount + 1}`,
            });
            return res.json(newField);
        } catch (e) {
            return next(ApiError.internal('Failed to create field'));
        }
    }

    async update(req, res, next) {
        const fieldId = req.params.id;
        const { fieldData, inventoryId } = req.body;

        if (!fieldData || !inventoryId || !fieldId) {
            return next(ApiError.badRequest('Missing fieldData, inventoryId or fieldId'));
        }

        try {
            const field = await Field.findOne({
                where: { id: fieldId, inventoryId },
            });

            if (!field) {
                return next(ApiError.notFound('Field not found'));
            }

            const fieldsTypeLimit = 3
            const fieldsType = await Field.findAll({where: {inventoryId, type: fieldData.type}})

            
            if (fieldsType.length >= fieldsTypeLimit) {
                return next(ApiError.badRequest('Fields type limit exceeded'))
            }

            const updated = await field.update(fieldData);
            return res.json(updated);
        } catch (e) {
            return next(ApiError.internal('Failed to update field'));
        }
    }

    async delete(req, res, next) {
        const fieldId = req.params.id;
        const { inventoryId } = req.body;

        if (!fieldId || !inventoryId) {
            return next(ApiError.badRequest('Missing fieldId or inventoryId'));
        }

        try {
            const deletedCount = await Field.destroy({
                where: { id: fieldId, inventoryId },
            });

            if (deletedCount === 0) {
                return next(ApiError.notFound('Field not found or not linked to inventory'));
            }

            return res.json({ message: 'Field deleted' });
        } catch (e) {
            return next(ApiError.internal('Failed to delete field'));
        }
    }

    async updatePositions(req, res, next) {
        const sortedFields = req.body;

        if (!Array.isArray(sortedFields)) {
            return next(ApiError.badRequest('Invalid sorted fields array'));
        }

        const transaction = await sequelize.transaction();

        try {
            await Promise.all(
                sortedFields.map((field, index) =>
                    Field.update(
                        { position: index + 1 },
                        { where: { id: field.id }, transaction }
                    )
                )
            );
            await transaction.commit();
            return res.json({ message: 'Positions updated' });
        } catch (e) {
            await transaction.rollback();
            return next(ApiError.internal('Failed to update positions'));
        }
    }
}


const fieldController = new FieldController()

export default fieldController
