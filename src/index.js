const http = require('http')
const cors = require('cors')
const express = require('express')
const fileUpload = require('express-fileupload')
const { PORT } = require('./config')
const logger = require('./helper/logger')
const { stackTraceMiddleware } = require('./middleware/authMiddleware')
const { errorMiddleware } = require('./middleware/errorMiddleware')
const router = require('./router')

const app = express()
app.use(cors())
app.use(fileUpload())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(stackTraceMiddleware)
app.use('/api', router)
app.use(errorMiddleware)

const server = http.createServer(app)

server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`)
})
