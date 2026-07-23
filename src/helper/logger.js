const path = require('path')
const winston = require('winston')
require('winston-daily-rotate-file')

const timestamp = winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })

const line = winston.format.printf(({ level, message, timestamp, stack }) => {
  return stack ? `${timestamp} ${level}: ${message}\n${stack}` : `${timestamp} ${level}: ${message}`
})

// Daily rotating file, auto-deleted after 7 days (maxFiles: '7d')
const fileTransport = new winston.transports.DailyRotateFile({
  dirname: path.join(process.cwd(), 'logs'),
  filename: 'app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '7d',
  format: winston.format.combine(timestamp, winston.format.errors({ stack: true }), line),
})

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(timestamp, winston.format.errors({ stack: true }), winston.format.colorize(), line),
    }),
    fileTransport,
  ],
})

module.exports = logger
