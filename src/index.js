const express = require('express')
const cors = require('cors')
const path = require('path')
const fileUpload = require('express-fileupload')
const { PORT } = require('./config')
const router = require('./router')
const { errorMiddleware } = require('./middleware/errorMiddleware')
const logger = require('./helper/logger')

const app = express()
app.use(cors())
app.use(fileUpload())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', router)
app.use(errorMiddleware)

const server = require('http').createServer(app)

server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`)
})
