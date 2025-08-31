import { DataTypes } from "sequelize";
import sequelize from "../db.js";

export const User = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true },
    name: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING },
    block_status: { type: DataTypes.INTEGER, defaultValue: 0 },
    last_login: { type: DataTypes.DATE }
})

export const Inventory = sequelize.define('inventory', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    image: { type: DataTypes.STRING }
})

export const Item = sequelize.define('item', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
},)

export const ItemValue = sequelize.define('itemValue', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    value: { type: DataTypes.JSONB }
}, {
    timestamps: false
})

export const Field = sequelize.define('field', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING },
    type: { type: DataTypes.STRING },
    visible: { type: DataTypes.INTEGER },
    position: { type: DataTypes.INTEGER }
})

export const SequenceCustomId = sequelize.define('sequenceCustomId', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    value: { type: DataTypes.TEXT }
}, {
    timestamps: false
})

export const CustomId = sequelize.define('customId', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    value: { type: DataTypes.STRING },
    type: { type: DataTypes.STRING },
    position: { type: DataTypes.INTEGER }
})

export const Category = sequelize.define('category', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, unique: true }
}, {
    timestamps: false
}
)

export const Tag = sequelize.define('tag', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, unique: true }
}, {
    timestamps: false
}
)

User.hasMany(Inventory)
Inventory.belongsTo(User)

Inventory.hasMany(Item)
Item.belongsTo(Inventory)

Item.belongsTo(User, {
    as: 'creator',
    foreignKey: 'creatorId'
})

Inventory.hasOne(SequenceCustomId)
SequenceCustomId.belongsTo(Inventory)

Inventory.hasMany(Field)
Field.belongsTo(Inventory)

Inventory.hasMany(CustomId)
CustomId.belongsTo(Inventory)

Category.hasMany(Inventory)
Inventory.belongsTo(Category)

Inventory.belongsToMany(Tag, { through: "TagsInventory", timestamps: false })
Tag.belongsToMany(Inventory, { through: "TagsInventory", timestamps: false })

Item.hasMany(ItemValue, { onDelete: 'CASCADE' })
ItemValue.belongsTo(Item, { onDelete: 'CASCADE' })

Field.hasMany(ItemValue, { onDelete: 'CASCADE' })
ItemValue.belongsTo(Field, { onDelete: 'CASCADE' })
