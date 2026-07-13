const Joi = require('joi')

const registerSchema = Joi.object({
  name: Joi.string().required(),
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
})

module.exports = { registerSchema, loginSchema, refreshSchema }
