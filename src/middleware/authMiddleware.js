const jwt = require('jsonwebtoken')
const config = require('../config')
const usersModel = require('../model/usersModel')
const { AuthenticationError } = require('../helper/customErrorHelper')
const { verifyToken } = require('../helper/jwtHelper')

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization
    if (!token) {
      throw new AuthenticationError('No token provided')
    }

    // Verify token
    const accessToken = token.split(' ')[1]
    const decoded = verifyToken(accessToken, 'access')
    if (!decoded) {
      throw new AuthenticationError('Invalid token')
    }

    // Find user
    const user = await usersModel.findOne({
      where: {
        id: decoded.id,
      },
      attributes: {
        exclude: ['password'],
      },
      raw: true,
    })
    if (!user) {
      throw new AuthenticationError('Invalid token')
    }

    // Check version
    if (user.version !== decoded.version) {
      throw new AuthenticationError('Invalid token')
    }

    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = authMiddleware
