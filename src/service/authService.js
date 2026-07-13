const { ValidationError } = require('../helper/customErrorHelper')
const { usersModel } = require('../model/relation')
const { registerSchema, loginSchema } = require('../validator/authValidator')
const validate = require('../validator/validator')
const BaseService = require('./baseService')
const { Op } = require('sequelize')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { createToken, verifyToken } = require('../helper/jwtHelper')

class AuthService extends BaseService {
  constructor(body = {}, query = {}, params = {}, user = {}, files = []) {
    super(body, query, params, user, files)
  }

  async register() {
    // Validate Request
    validate(registerSchema, this.body)

    // Get Request
    const { name, username, email, password } = this.body

    // Validation
    const findUser = await usersModel.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
      raw: true,
    })
    if (findUser) {
      throw new ValidationError('Username or Email already exists')
    }

    // Create User
    const user = await usersModel.create({
      name,
      username,
      email,
      password: await bcrypt.hash(password, 10),
    })

    return true
  }

  async login() {
    // Validate Request
    validate(loginSchema, this.body)

    // Get Request
    const { email, password } = this.body

    // Find User
    const user = await usersModel.findOne({
      where: {
        [Op.or]: [{ username: email }, { email }],
      },
    })
    if (!user) {
      throw new ValidationError('Username or Email not found')
    }

    // Check Password
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
      throw new ValidationError('Password incorrect')
    }

    // Generate Token
    const accessToken = createToken({ id: user.id, version: user.version }, 'access')
    const refreshToken = createToken({ id: user.id, version: user.version }, 'refresh')

    return { accessToken, refreshToken }
  }

  async identify() {
    delete this.user.version
    return this.user
  }

  async refresh() {
    // Validate Request
    validate(refreshSchema, this.body)

    // Get Request
    const { refreshToken } = this.body

    // Verify Token
    const decoded = verifyToken(refreshToken)
    if (!decoded) {
      throw new ValidationError('Invalid token')
    }

    // Generate Token
    const newAccessToken = createToken({ id: decoded.id, version: decoded.version }, 'access')
    const newRefreshToken = createToken({ id: decoded.id, version: decoded.version }, 'refresh')

    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
  }

  async logout() {
    // Update User Version
    await usersModel.update(
      {
        version: this.user.version + 1,
      },
      {
        where: {
          id: this.user.id,
        },
      }
    )

    return true
  }
}

module.exports = AuthService
