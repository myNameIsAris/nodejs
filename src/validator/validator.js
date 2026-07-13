const { ValidationError } = require('../helper/customErrorHelper')

const validate = (schema, request) => {
  const result = schema.validate(request, {
    abortEarly: false,
    allowUnknown: false,
  })

  if (result.error) {
    const errorMessages = result.error.details.map((detail) => detail.message + ' ')
    throw new ValidationError(errorMessages)
  }

  return result.value
}

module.exports = validate
