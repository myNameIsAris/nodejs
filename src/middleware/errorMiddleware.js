const { response } = require('../helper/responseHelper')
const logger = require('../helper/logger')

const errorMiddleware = async (error, req, res, next) => {
  if (!error) {
    return next()
  }
  logger.error(error)

  switch (error.name) {
    case 'ValidationError':
      return response(res, error.code, 'Bad Request', null, {}, error.message)

    case 'NotFoundError':
      return response(res, error.code, 'Not Found', null, {}, error.message)

    case 'AuthenticationError':
      return response(res, error.code, 'Auth Error', null, {}, error.message)

    case 'ForbiddenError':
      return response(res, error.code, 'Forbidden Error', null, {}, error.message)

    case 'ConflictError':
      return response(res, error.code, 'Conflict Error', null, {}, error.message)

    case 'ServerError':
      return response(res, 500, 'Internal Server Error', null, {}, error.message)

    case 'BadGatewayError':
      return response(res, error.code, 'Bad Gateway', null, {}, error.message)

    default:
      return response(res, 500, 'Internal Server Error', null, {}, error.message)
  }
}

module.exports = { errorMiddleware }
