const { response } = require('../helper/responseHelper')
const authService = require('../service/authService')

exports.register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body
    const result = await authService.register(name, username, email, password)
    return response(res, 201, 'Success', 'Success register user', result)
  } catch (error) {
    next(error)
  }
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const result = await authService.login(email, password)
    return response(res, 200, 'Success', 'Success login user', result)
  } catch (error) {
    next(error)
  }
}

exports.identify = (req, res, next) => {
  try {
    const result = authService.identify(req.user)
    return response(res, 200, 'Success', 'Success identify user', result)
  } catch (error) {
    next(error)
  }
}

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    const result = await authService.refresh(refreshToken)
    return response(res, 200, 'Success', 'Success refresh user', result)
  } catch (error) {
    next(error)
  }
}

exports.logout = async (req, res, next) => {
  try {
    const result = await authService.logout(req.user.id, req.user.version)
    return response(res, 200, 'Success', 'Success logout user', result)
  } catch (error) {
    next(error)
  }
}
