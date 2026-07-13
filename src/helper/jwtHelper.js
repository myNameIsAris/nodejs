const jwt = require('jsonwebtoken')
const { JWT } = require('../config')

const verifyToken = (token, type) => {
  try {
    if (type === 'access') {
      return jwt.verify(token, JWT.SECRET)
    }
    return jwt.verify(token, JWT.REFRESH)
  } catch (error) {
    return null
  }
}

const createToken = (payload, type) => {
  if (type === 'access') {
    return jwt.sign(payload, JWT.SECRET, {
      expiresIn: '1d',
    })
  }
  return jwt.sign(payload, JWT.REFRESH, {
    expiresIn: '7d',
  })
}

module.exports = {
  verifyToken,
  createToken,
}
