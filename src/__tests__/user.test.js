const request = require('supertest')
const { makeToken, makeUser } = require('../helper/testHelper')
const { createApp, setupDB, teardownDB, resetDB } = require('../helper/testSetup')
const { usersModel } = require('../model/relation')

const app = createApp()

const authFor = async (overrides = {}) => {
  const user = await usersModel.create(makeUser(overrides))
  const token = makeToken({ id: user.id, version: user.version }, 'access')
  return { user, token }
}

// supertest doesn't buffer binary bodies by default → collect into a Buffer
const parseBinary = (res, cb) => {
  const chunks = []
  res.on('data', (c) => chunks.push(c))
  res.on('end', () => cb(null, Buffer.concat(chunks)))
}

describe('Users API', () => {
  beforeAll(async () => {
    await setupDB()
  })

  afterAll(async () => {
    await teardownDB()
  })

  afterEach(async () => {
    await resetDB()
  })

  describe('GET /api/users', () => {
    it('should return 200 with all users excluding password and version', async () => {
      const { token } = await authFor({ email: 'a@test.com', username: 'a' })
      await usersModel.create(makeUser({ email: 'b@test.com', username: 'b' }))

      const res = await request(app).get('/api/users').set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.httpCode).toBe(200)
      expect(res.body.message).toBe('Success get all users')
      expect(res.body.data).toHaveLength(2)
      expect(res.body.data[0].password).toBeUndefined()
      expect(res.body.data[0].version).toBeUndefined()
    })

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/users')

      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/users/export', () => {
    it('should return an xlsx file for type=excel', async () => {
      const { token } = await authFor()

      const res = await request(app).get('/api/users/export?type=excel').set('Authorization', `Bearer ${token}`).buffer().parse(parseBinary)

      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toContain('spreadsheetml')
      expect(res.headers['content-disposition']).toContain('users.xlsx')
      // xlsx is a zip archive → starts with "PK"
      expect(res.body.slice(0, 2).toString()).toBe('PK')
    })

    it('should return a pdf file for type=pdf', async () => {
      const { token } = await authFor()

      const res = await request(app).get('/api/users/export?type=pdf').set('Authorization', `Bearer ${token}`).buffer().parse(parseBinary)

      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toContain('application/pdf')
      expect(res.headers['content-disposition']).toContain('users.pdf')
      // pdf files start with "%PDF"
      expect(res.body.slice(0, 4).toString()).toBe('%PDF')
    })

    it('should return 400 on invalid export type', async () => {
      const { token } = await authFor()

      const res = await request(app).get('/api/users/export?type=csv').set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(400)
      expect(res.body.error.message).toContain('Invalid export type')
    })

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/users/export?type=excel')

      expect(res.status).toBe(401)
    })
  })
})
