const { Sequelize } = require('sequelize')
const { DB } = require('.')

const pgsql = new Sequelize(DB.NAME, DB.USER, DB.PASS, {
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

if (process.env.NODE_ENV !== 'test') {
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
