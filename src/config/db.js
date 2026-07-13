const { Sequelize } = require('sequelize')
const { DB } = require('.')

const isTest = process.env.NODE_ENV === 'test'

const pgsql = isTest
  ? new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    })
  : new Sequelize(DB.NAME, DB.USER, DB.PASS, {
      host: DB.HOST,
      port: DB.PORT,
      dialect: 'postgres',
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 60000,
        idle: 10000,
      },
    })

if (!isTest) {
  pgsql
    .authenticate()
    .then(async () => {
      console.info(`Successfully connect to database ${DB.HOST}:${DB.NAME}`)
    })
    .catch((err) => {
      console.error(`Failed to connect to ${DB.HOST}:${DB.NAME} with error ${err}`)
    })
}

module.exports = { pgsql }
