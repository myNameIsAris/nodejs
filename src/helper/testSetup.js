const express = require('express')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const { pgsql } = require('../config/db')
const router = require('../router')
const { errorMiddleware } = require('../middleware/errorMiddleware')

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
