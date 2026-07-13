const response = (resp, httpCode, httpMessage, message = null, data = null, error = null) => {
  return resp.status(httpCode).send({ httpCode, httpMessage, message, data, error })
}

module.exports = {
  response,
}
