import { Inventory, Tag } from "../../models/models.js"
import ApiError from '../../error/apiError.js'
import { Op } from "sequelize"

class TagsController {
    async createTags(req, res, next) {
        const { tags, inventoryId } = req.body

        const inventory = await Inventory.findOne({ where: { id: inventoryId } })

        // const dataTags = await Tag.findAll({ where: { title: { [Op.in]: tags } } })

        // res.json(dataTags)
        try {    
            // const createdTags = await Promise.all(tags.map(tag =>
            //     Tag.create({ title: tag })
            // ))
            const createdTags = await Tag.bulkCreate(tags, {ignoreDuplicates: true})
            const setTags = Promise.all((createdTags).map(tag =>
                inventory.setTags(tag)
            ))

            return res.json(createdTags, setTags)
        } catch (e) {
            return next(ApiError.badRequest('Failed to create tags'))
        }
    }

    async getTagsBeginning(req, res, next) {
        const prefix = req.query.prefix

        const searchedTags = await Tag.findAll({
            where: {
                title: {
                    [Op.iLike]: `${prefix}%`
                }
            }
        })
        res.json(searchedTags)
    }
}

const tagsController = new TagsController()

export default tagsController