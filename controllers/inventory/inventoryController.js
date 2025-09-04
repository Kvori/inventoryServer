import sequelize from '../../db.js';
import ApiError from '../../error/apiError.js';
import { Category, Inventory, Tag, User } from '../../models/models.js';
import getDeepDiff from '../../utils/diff.js';
import { Op } from 'sequelize';

class InventoryController {
    async create(req, res, next) {
        const userId = req.body.userId;

        const inventoriesLength = await Inventory.count({
            where: { creatorId: userId },
        });

        const transaction = await sequelize.transaction();

        try {
            const [user, category] = await Promise.all([
                User.findByPk(userId),
                Category.findOne()
            ]);

            if (!user || !category) {
                await transaction.rollback();
                return next(ApiError.badRequest('Incorrect user or category'));
            }

            const inventory = await Inventory.create({
                title: `New inventory ${inventoriesLength + 1}`,
            }, { transaction });

            await Promise.all([
                inventory.setCreator(user, { transaction }),
                inventory.setCategory(category, { transaction }),
            ]);

            await transaction.commit();
            return res.json(inventory);
        } catch (e) {
            await transaction.rollback();
            return next(ApiError.internal('Failed to create inventory'));
        }
    }

    async deleteInventories(req, res, next) {
        const { inventoryIds } = req.body;

        if (!inventoryIds) {
            return next(ApiError.badRequest('Incorrect inventory ids'));
        }

        try {
            const deletedCount = await Inventory.destroy({
                where: {
                    id: {
                        [Op.in]: inventoryIds
                    }
                }
            });

            return res.json({ message: `Deleted ${deletedCount} inventories` });
        } catch (e) {
            return next(ApiError.internal('Failed to delete inventories'));
        }
    }

    async getOne(req, res, next) {
        const id = req.params.id;

        try {
            const inventory = await Inventory.findByPk(id, {
                include: [{
                    model: Tag,
                    attributes: ['title'],
                    through: { attributes: [] }
                }]
            });

            if (!inventory) {
                return next(ApiError.notFound('Inventory not found'));
            }

            return res.json(inventory);
        } catch (e) {
            return next(ApiError.internal('Failed to fetch inventory'));
        }
    }

    async getAllCreated(req, res, next) {
        const userId = req.params.id;

        try {
            const inventories = await Inventory.findAll({
                where: { creatorId: userId }
            });

            return res.json(inventories);
        } catch (e) {
            return next(ApiError.internal('Failed to fetch inventories'));
        }
    }

    async getAllAvailable(req, res, next) {
        const userId = req.params.id;

        try {
            const inventories = await Inventory.findAll({
                where: {
                    creatorId: {
                        [Op.ne]: userId
                    }
                }
            });

            return res.json(inventories);
        } catch (e) {
            return next(ApiError.internal('Failed to fetch inventories'));
        }
    }

    async saveSettings(req, res, next) {
        const inventoryId = req.params.id;
        const { inventoryData, tags } = req.body;

        if (!inventoryData || !tags) {
            return next(ApiError.badRequest('Missing inventory data or tags'));
        }

        try {
            const inventory = await Inventory.findByPk(inventoryId);

            if (!inventory) {
                return next(ApiError.notFound('Inventory does not exist'));
            }

            const diff = getDeepDiff(inventory, inventoryData);
            const updatedInventory = await inventory.update(diff);

            await Tag.bulkCreate(tags, { ignoreDuplicates: true });

            const savedTags = await Tag.findAll({
                where: {
                    title: {
                        [Op.in]: tags.map(tag => tag.title)
                    }
                }
            });

            await updatedInventory.setTags(savedTags);

            return res.json({ updatedInventory });
        } catch (e) {
            return next(ApiError.internal('Failed to update inventory settings'));
        }
    }

    async updateFavorite(req, res, next) {
        const userId = req.user.id;
        const inventoryId = req.params.id;
        const { favoriteFlag } = req.body;

        try {
            const [user, inventory] = await Promise.all([
                User.findByPk(userId),
                Inventory.findByPk(inventoryId)
            ]);

            if (!user || !inventory) {
                return next(ApiError.badRequest('User or inventory not found'));
            }

            const creator = await inventory.getCreator();
            if (user.id === creator.id) {
                return next(ApiError.badRequest('Cannot favorite your own inventory'));
            }

            if (favoriteFlag) {
                await user.addFavorite(inventory);
                return res.json({ message: 'Inventory added to favorites' });
            } else {
                await user.removeFavorite(inventory);
                return res.json({ message: 'Inventory removed from favorites' });
            }
        } catch (e) {
            return next(ApiError.internal('Failed to update favorite status'));
        }
    }

    async checkFavorite(req, res, next) {
        const userId = req.user.id;
        const inventoryId = req.params.id;

        try {
            const user = await User.findByPk(userId);
            const inventory = await Inventory.findByPk(inventoryId);

            if (!user || !inventory) {
                return next(ApiError.badRequest('User or inventory not found'));
            }

            const favorites = await user.getFavorites({ where: { id: inventoryId } });
            const favoriteFlag = favorites.length > 0;

            return res.json({ favoriteFlag });
        } catch (e) {
            return next(ApiError.internal('Failed to check favorite status'));
        }
    }

    async getFavoriteInventoriesByUser(req, res, next) {
        const userId = req.params.userId;

        try {
            const user = await User.findByPk(userId);

            if (!user) {
                return next(ApiError.badRequest('User not found'));
            }

            const favorites = await user.getFavorites();

            return res.json(favorites);
        } catch (e) {
            return next(ApiError.internal('Failed to fetch favorite inventories'));
        }
    }

    async getTopInventoriesByItemCount(req, res, next) {
        try {
            const inventories = await Inventory.findAll({
                attributes: {
                    include: [
                        [fn("COUNT", col("items.id")), "itemCount"]
                    ]
                },
                include: [
                    {
                        model: Item,
                        attributes: [],
                    },
                    {
                        model: User,
                        as: "creator",
                        attributes: ["id", "name"]
                    }
                ],
                group: ["inventory.id", "creator.id"],
                order: [[literal("itemCount"), "DESC"]],
                limit: 5
            });

            return res.json(inventories);
        } catch (e) {
            return next(ApiError.internal("Failed to fetch top inventories"));
        }
    }

    async getTop(req, res, next) {
        const test = await Inventory.findAll({ where: {} })
    }
}

export default new InventoryController();
