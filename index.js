import express from 'express'
import cors from 'cors'
import sequelize from './db.js'
import router from './routes/index.js'
import ErrorHandler from './middleware/errorHandlingMiddleware.js'
import { Category } from './models/models.js'
import { Category_Default } from './consts.js'

const PORT = process.env.PORT || 5000
const app = express()

app.use(cors({
    origin: ['https://inventoryserver-production-48b8.up.railway.app', 'https://inventoryserver-production-48b8.up.railway.app/login'],
    credentials: false,
    methods: ['POST', 'GET', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }))
app.use(express.json())
app.use('/api', router)

app.use(ErrorHandler)

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync({ alter: true })

        await Category.bulkCreate(Category_Default, { ignoreDuplicates: true })

        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`)
        })

        console.log('Connection has been established successfully.')
    } catch (error) {
        console.error('Unable to connect to the database:', error)
    }
}

start()