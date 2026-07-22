require('dotenv').config()

module.exports = {
  PORT: process.env.PORT || 3000,
  ENV: process.env.NODE_ENV,
  DB: {
    HOST: process.env.DB_HOST,
    PORT: process.env.DB_PORT,
    USER: process.env.DB_USER,
    PASS: process.env.DB_PASS,
    NAME: process.env.DB_NAME,
  },
  JWT: {
    SECRET: process.env.JWT_SECRET,
    REFRESH: process.env.JWT_REFRESH_SECRET,
  },
}
