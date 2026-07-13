const { HttpStatusCode } = require('axios')

class ValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ValidationError'
    this.code = HttpStatusCode.BadRequest
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NotFoundError'
    this.code = HttpStatusCode.NotFound
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'AuthenticationError'
    this.code = HttpStatusCode.Unauthorized
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ForbiddenError'
    this.code = HttpStatusCode.Forbidden
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ConflictError'
    this.code = HttpStatusCode.Conflict
  }
}

class ServerError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ServerError'
    this.code = HttpStatusCode.InternalServerError
  }
}

class BadGatewayError extends Error {
  constructor(message) {
    super(message)
    this.name = 'BadGatewayError'
    this.code = HttpStatusCode.BadGateway
  }
}

class GoneError extends Error {
  constructor(message) {
    super(message)
    this.name = 'GoneError'
    this.code = HttpStatusCode.Gone
  }
}

function handleError(next, entity, action, action_desc, error) {
  error._entity = entity
  error._action = action
  error._action_desc = action_desc
  next(error)
}

module.exports = {
  ValidationError,
  NotFoundError,
  AuthenticationError,
  ForbiddenError,
  ConflictError,
  ServerError,
  BadGatewayError,
  GoneError,
  handleError,
}
