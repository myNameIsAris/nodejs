const { response } = require('../helper/responseHelper')
const logger = require('../helper/logger')

const errorMiddleware = async (error, req, res, next) => {
  if (!error) {
    return next()
  }
  logger.error(req.id, error)

  const errorMessages = {
    ValidationError: 'Bad Request',
    NotFoundError: 'Not Found',
    AuthenticationError: 'Auth Error',
    ForbiddenError: 'Forbidden Error',
    ConflictError: 'Conflict Error',
    ServerError: 'Internal Server Error',
    BadGatewayError: 'Bad Gateway'
  }

  const httpMessage = errorMessages[error.name] || 'Internal Server Error'
  const httpCode = (error.name === 'ServerError' || !errorMessages[error.name]) ? 500 : error.code
  const errorDetails = { message: error.message, trace_id: req.id }

  return response(res, httpCode, httpMessage, null, {}, errorDetails)
}

module.exports = { errorMiddleware }
