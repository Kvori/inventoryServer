import express from 'express'
import cors from 'cors'
import sequelize from './db.js'
import router from './routes/index.js'
import ErrorHandler from './middleware/errorHandlingMiddleware.js'
import session from 'express-session'
import SequelizeStore from 'connect-session-sequelize'
import initSocket from './ws/index.js'
import http from 'http'
import { Category } from './models/models.js'
import { Category_Default } from './consts.js'

const PORT = process.env.PORT || 5000
const app = express()

const SessionStore = SequelizeStore(session.Store)

const store = new SessionStore({
    db: sequelize,
    tableName: 'sessions',
    checkExpirationInterval: 15 * 60 * 1000,
    expiration: 24 * 60 * 60 * 1000
})

app.use(session({
    secret: process.env.SECRET_KEY,
    store: store,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        secure: true
    }
}))
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))
app.use(express.json())
app.use('/api', router)

app.use(ErrorHandler)

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync({ alter: true })
        await store.sync()

        await Category.bulkCreate(Category_Default, { ignoreDuplicates: true })

        const server = http.createServer(app)

        initSocket(server)

        server.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`)
        })

        console.log('Connection has been established successfully.')
    } catch (error) {
        console.error('Unable to connect to the database:', error)
    }
}

start()