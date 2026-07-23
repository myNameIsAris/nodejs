const cors = require('cors')
const express = require('express')
const fileUpload = require('express-fileupload')
const { pgsql } = require('../config/db')
const { errorMiddleware } = require('../middleware/errorMiddleware')
const router = require('../router')

const createApp = () => {
  const app = express()
  app.use(cors())
  app.use(fileUpload())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use('/api', router)
  app.use(errorMiddleware)
  return app
}

const setupDB = async () => {
  await pgsql.sync({ force: true })
}

const teardownDB = async () => {
  await pgsql.close()
}

const resetDB = async () => {
  await pgsql.truncate({ cascade: true, restartIdentity: true })
}

module.exports = { createApp, setupDB, teardownDB, resetDB, pgsql }
