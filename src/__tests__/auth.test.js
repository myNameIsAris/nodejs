const request = require('supertest')
const bcrypt = require('bcryptjs')
const { usersModel } = require('../model/relation')
const { createApp, setupDB, teardownDB, resetDB } = require('../helper/testSetup')
const { makeRegisterBody, makeLoginBody, makeToken, makeUser } = require('../helper/testHelper')

const app = createApp()

describe('Auth API', () => {
  beforeAll(async () => {
    await setupDB()
  })

  afterAll(async () => {
    await teardownDB()
  })

  afterEach(async () => {
    await resetDB()
  })

  // ── POST /api/auth/register ──────────────────────────────────────────
  describe('POST /api/auth/register', () => {
    it('should return 200 and success message on valid registration', async () => {
      const body = makeRegisterBody()

      const res = await request(app).post('/api/auth/register').send(body)

      expect(res.status).toBe(200)
      expect(res.body.httpCode).toBe(200)
      expect(res.body.message).toBe('Success register user')
      expect(res.body.data).toBe(true)

      // verify user actually created in DB
      const user = await usersModel.findOne({ where: { email: body.email }, raw: true })
      expect(user).not.toBeNull()
      expect(user.name).toBe(body.name)
      expect(user.username).toBe(body.username)

      // password must be hashed
      const match = await bcrypt.compare(body.password, user.password)
      expect(match).toBe(true)
    })

    it('should return 400 when required fields are missing', async () => {
      const res = await request(app).post('/api/auth/register').send({})

      expect(res.status).toBe(400)
      expect(res.body.httpCode).toBe(400)
    })

    it('should return 400 on duplicate email', async () => {
      // seed a user
      await usersModel.create(makeUser({ email: 'dup@test.com' }))
      const body = makeRegisterBody({ email: 'dup@test.com' })

      const res = await request(app).post('/api/auth/register').send(body)

      expect(res.status).toBe(400)
      expect(res.body.error).toContain('Username or Email already exists')
    })
  })

  // ── POST /api/auth/login ─────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    it('should return 200 with tokens on valid login', async () => {
      const plainPassword = 'Password123'
      const user = makeUser({ password: plainPassword })
      await usersModel.create(user)
      const body = makeLoginBody({ email: user.email, password: plainPassword })

      const res = await request(app).post('/api/auth/login').send(body)

      expect(res.status).toBe(200)
      expect(res.body.httpCode).toBe(200)
      expect(res.body.data.accessToken).toBeDefined()
      expect(res.body.data.refreshToken).toBeDefined()
    })

    it('should return 400 when user not found', async () => {
      const body = makeLoginBody({ email: 'nobody@test.com' })

      const res = await request(app).post('/api/auth/login').send(body)

      expect(res.status).toBe(400)
      expect(res.body.error).toContain('Username or Email not found')
    })

    it('should return 400 when password is incorrect', async () => {
      const user = await usersModel.create(makeUser({ password: 'CorrectPass1' }))
      const body = makeLoginBody({ email: user.email, password: 'WrongPass1' })

      const res = await request(app).post('/api/auth/login').send(body)

      expect(res.status).toBe(400)
      expect(res.body.error).toContain('Password incorrect')
    })
  })

  // ── GET /api/auth/identify ───────────────────────────────────────────
  describe('GET /api/auth/identify', () => {
    it('should return 200 with user data (no password, no version)', async () => {
      const user = await usersModel.create(makeUser({ name: 'Aris' }))
      const token = makeToken({ id: user.id, version: user.version }, 'access')

      const res = await request(app).get('/api/auth/identify').set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data).toMatchObject({ id: user.id, name: 'Aris' })
      expect(res.body.data.password).toBeUndefined()
      expect(res.body.data.version).toBeUndefined()
    })

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/identify')

      expect(res.status).toBe(401)
    })

    it('should return 401 with invalid token', async () => {
      const res = await request(app).get('/api/auth/identify').set('Authorization', 'Bearer invalid-token')

      expect(res.status).toBe(401)
    })
  })

  // ── POST /api/auth/refresh ───────────────────────────────────────────
  describe('POST /api/auth/refresh', () => {
    it('should return 200 with new token pair', async () => {
      const user = await usersModel.create(makeUser())
      const refreshToken = makeToken({ id: user.id, version: user.version }, 'refresh')

      const res = await request(app).post('/api/auth/refresh').send({ refreshToken })

      expect(res.status).toBe(200)
      expect(res.body.data.accessToken).toBeDefined()
      expect(res.body.data.refreshToken).toBeDefined()
      // both tokens are valid JWT strings
      expect(typeof res.body.data.accessToken).toBe('string')
      expect(typeof res.body.data.refreshToken).toBe('string')
    })

    it('should return 400 with invalid refresh token', async () => {
      const res = await request(app).post('/api/auth/refresh').send({ refreshToken: 'garbage-token' })

      expect(res.status).toBe(400)
    })
  })

  // ── POST /api/auth/logout ────────────────────────────────────────────
  describe('POST /api/auth/logout', () => {
    it('should return 200 and increment version', async () => {
      const user = await usersModel.create(makeUser({ version: 0 }))
      const token = makeToken({ id: user.id, version: user.version }, 'access')

      const res = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data).toBe(true)

      // verify version incremented
      const updated = await usersModel.findByPk(user.id, { raw: true })
      expect(updated.version).toBe(1)
    })

    it('should return 401 on subsequent identify after logout', async () => {
      const user = await usersModel.create(makeUser({ version: 0 }))
      const token = makeToken({ id: user.id, version: user.version }, 'access')

      // logout
      await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`)

      // attempt identify with same token (version mismatch now)
      const res = await request(app).get('/api/auth/identify').set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(401)
    })
  })
})
