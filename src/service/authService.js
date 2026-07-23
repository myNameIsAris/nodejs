const bcrypt = require('bcryptjs')
const { Op } = require('sequelize')
const { BCRYPT_ROUNDS } = require('../config')
const { ValidationError } = require('../helper/customErrorHelper')
const { createToken, verifyToken } = require('../helper/jwtHelper')
const { usersModel } = require('../model/relation')
const { registerSchema, loginSchema, refreshSchema } = require('../validator/authValidator')
const validate = require('../validator/validator')

class AuthService {
  async register(name, username, email, password) {
    // Validate Request
    validate(registerSchema, { name, username, email, password })

    // Check existing user
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
    await usersModel.create({
      name,
      username,
      email,
      password: await bcrypt.hash(password, BCRYPT_ROUNDS),
    })

    return true
  }

  async login(email, password) {
    // Validate Request
    validate(loginSchema, { email, password })

    // Find User
    const user = await usersModel.findOne({
      where: {
        [Op.or]: [{ username: email }, { email }],
      },
      attributes: ['id', 'version', 'password'],
    })
    if (!user) {
      throw new ValidationError('Invalid credentials')
    }

    // Check Password
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
      throw new ValidationError('Invalid credentials')
    }

    // Generate Token
    const accessToken = createToken({ id: user.id, version: user.version }, 'access')
    const refreshToken = createToken({ id: user.id, version: user.version }, 'refresh')

    return { accessToken, refreshToken }
  }

  identify(user) {
    const { version, ...safe } = user
    return safe
  }

  async refresh(refreshToken) {
    // Validate Request
    validate(refreshSchema, { refreshToken })

    // Verify Token
    let decoded
    try {
      decoded = verifyToken(refreshToken, 'refresh')
    } catch (error) {
      throw new ValidationError('Invalid token')
    }

    // Check token not revoked (version must match current user version)
    const user = await usersModel.findByPk(decoded.id, {
      attributes: ['id', 'version'],
      raw: true,
    })
    if (!user || user.version !== decoded.version) {
      throw new ValidationError('Invalid token')
    }

    // Generate Token
    const newAccessToken = createToken({ id: user.id, version: user.version }, 'access')
    const newRefreshToken = createToken({ id: user.id, version: user.version }, 'refresh')

    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
  }

  async logout(userId, userVersion) {
    // Update User Version
    await usersModel.update(
      {
        version: userVersion + 1,
      },
      {
        where: {
          id: userId,
        },
      }
    )

    return true
  }
}

module.exports = new AuthService()
