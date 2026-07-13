const { NotFoundError, ForbiddenError, ConflictError, ServerError, BadGatewayError, GoneError, handleError } = require('../helper/customErrorHelper')
const { errorMiddleware } = require('../middleware/errorMiddleware')
const BaseService = require('../service/baseService')
const { response } = require('../helper/responseHelper')
const request = require('supertest')
const { createApp } = require('../helper/testSetup')

describe('GET /api/ping', () => {
  it('should return Pong', async () => {
    const app = createApp()
    const res = await request(app).get('/api/ping')

    expect(res.status).toBe(200)
    expect(res.text).toBe('Pong')
  })
})

describe('errorMiddleware', () => {
  const mockRes = () => {
    const res = {}
    res.status = jest.fn().mockReturnValue(res)
    res.send = jest.fn().mockReturnValue(res)
    return res
  }

  it.each([
    ['NotFoundError', NotFoundError, 404, 'Not Found'],
    ['ForbiddenError', ForbiddenError, 403, 'Forbidden Error'],
    ['ConflictError', ConflictError, 409, 'Conflict Error'],
    ['ServerError', ServerError, 500, 'Internal Server Error'],
    ['BadGatewayError', BadGatewayError, 502, 'Bad Gateway'],
  ])('should handle %s', async (_name, ErrorClass, code, httpMessage) => {
    const error = new ErrorClass('test')
    const res = mockRes()
    await errorMiddleware(error, {}, res, () => {})
    expect(res.status).toHaveBeenCalledWith(code)
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ httpCode: code, httpMessage }))
  })

  it('should handle unknown error (default branch)', async () => {
    const error = new Error('unknown')
    error.name = 'SomeUnknownError'
    const res = mockRes()
    await errorMiddleware(error, {}, res, () => {})
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ httpCode: 500, httpMessage: 'Internal Server Error' }))
  })

  it('should call next() when no error', async () => {
    const next = jest.fn()
    await errorMiddleware(null, {}, {}, next)
    expect(next).toHaveBeenCalled()
  })

  it('should handle GoneError via default branch', async () => {
    const error = new GoneError('gone')
    const res = mockRes()
    await errorMiddleware(error, {}, res, () => {})
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ httpCode: 500, httpMessage: 'Internal Server Error' }))
  })
})

describe('handleError', () => {
  it('should attach metadata and call next', () => {
    const next = jest.fn()
    const error = new Error('test')
    handleError(next, 'User', 'create', 'creating user', error)
    expect(error._entity).toBe('User')
    expect(error._action).toBe('create')
    expect(error._action_desc).toBe('creating user')
    expect(next).toHaveBeenCalledWith(error)
  })
})

describe('BaseService', () => {
  it('should use default values when called with no arguments', () => {
    const svc = new BaseService()
    expect(svc.body).toEqual({})
    expect(svc.query).toEqual({})
    expect(svc.params).toEqual({})
    expect(svc.user).toEqual({})
    expect(svc.files).toEqual([])
  })
})

describe('response helper', () => {
  it('should include error in response when provided', () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    }

    response(res, 400, 'Bad Request', 'msg', null, 'something broke')

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith({
      httpCode: 400,
      httpMessage: 'Bad Request',
      message: 'msg',
      data: null,
      error: 'something broke',
    })
  })

  it('should use default values when optional parameters are omitted', () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    }

    response(res, 200, 'OK')

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({
      httpCode: 200,
      httpMessage: 'OK',
      message: null,
      data: null,
      error: null,
    })
  })
})
