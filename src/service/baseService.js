class BaseService {
  constructor(body = {}, query = {}, params = {}, user = {}, files = []) {
    this.body = body
    this.query = query
    this.params = params
    this.user = user
    this.files = files
  }
}

module.exports = BaseService
