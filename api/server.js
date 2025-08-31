import express from 'express'
import cors from 'cors'
import sequelize from '../db.js'
import router from '../routes/index.js'
import ErrorHandler from '../middleware/errorHandlingMiddleware.js'
import session from 'express-session'
import SequelizeStore from 'connect-session-sequelize'
import { Category } from '../models/models.js'
import { Category_Default } from '../consts.js'
import serverless from 'serverless-http'

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
    sameSite: 'none',
    secure: true
  }
}))

const cleanOrigin = process.env.CLIENT_URL?.replace(/^['"]|['"]$/g, '').replace(/\/$/, '')

app.use(cors({
  origin: cleanOrigin,
  credentials: true
}))
app.use(express.json())
app.use('/api', router)
app.use(ErrorHandler)

let initialized = false
const initialize = async () => {
  if (initialized) return
  await sequelize.authenticate()
  await sequelize.sync({ alter: true })
  await store.sync()
  await Category.bulkCreate(Category_Default, { ignoreDuplicates: true })
  initialized = true
}

const handler = async (req, res) => {
  await initialize()
  return serverless(app)(req, res)
}

export default handler
