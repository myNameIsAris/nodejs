const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const makeRegisterBody = (overrides = {}) => ({
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  password: 'Password123',
  ...overrides,
})

const makeLoginBody = (overrides = {}) => ({
  email: 'test@example.com',
  password: 'Password123',
  ...overrides,
})

const makeRefreshBody = (overrides = {}) => ({
  refreshToken: 'valid-refresh-token',
  ...overrides,
})

const makeUser = (overrides = {}) => {
  const rawPassword = overrides.password || 'Password123'
  return {
    id: overrides.id || crypto.randomUUID(),
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    password: bcrypt.hashSync(rawPassword, 10),
    version: 0,
    created_at: new Date(),
    ...overrides,
    password: overrides.password ? bcrypt.hashSync(overrides.password, 10) : bcrypt.hashSync('Password123', 10),
  }
}

const makeToken = (payload = {}, type = 'access', secret) => {
  const s = secret || (type === 'access' ? process.env.JWT_SECRET || 'access-secret' : process.env.JWT_REFRESH_SECRET || 'refresh-secret')
  const expiresIn = type === 'access' ? '1d' : '7d'
  return jwt.sign({ id: crypto.randomUUID(), version: 0, ...payload }, s, { expiresIn })
}

module.exports = {
  makeRegisterBody,
  makeLoginBody,
  makeRefreshBody,
  makeUser,
  makeToken,
}
