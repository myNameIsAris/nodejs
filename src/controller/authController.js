const { response } = require('../helper/responseHelper')
const authService = require('../service/authService')

class AuthController {
  async register(req, res, next) {
    try {
      const service = new authService(req.body, req.query, req.params, req.user, req.files)
      const result = await service.register()
      return response(res, 200, 'Success', 'Success register user', result)
    } catch (error) {
      next(error)
    }
  }

  async login(req, res, next) {
    try {
      const service = new authService(req.body, req.query, req.params, req.user, req.files)
      const result = await service.login()
      return response(res, 200, 'Success', 'Success login user', result)
    } catch (error) {
      next(error)
    }
  }

  async identify(req, res, next) {
    try {
      const service = new authService(req.body, req.query, req.params, req.user, req.files)
      const result = await service.identify()
      return response(res, 200, 'Success', 'Success identify user', result)
    } catch (error) {
      next(error)
    }
  }

  async refresh(req, res, next) {
    try {
      const service = new authService(req.body, req.query, req.params, req.user, req.files)
      const result = await service.refresh()
      return response(res, 200, 'Success', 'Success refresh user', result)
    } catch (error) {
      next(error)
    }
  }

  async logout(req, res, next) {
    try {
      const service = new authService(req.body, req.query, req.params, req.user, req.files)
      const result = await service.logout()
      return response(res, 200, 'Success', 'Success logout user', result)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new AuthController()
