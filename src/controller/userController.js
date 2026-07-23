const { ValidationError } = require('../helper/customErrorHelper')
const { response } = require('../helper/responseHelper')
const userService = require('../service/userService')

const EXPORTS = {
  excel: {
    method: 'exportExcel',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    filename: 'users.xlsx',
  },
  pdf: {
    method: 'exportPdf',
    type: 'application/pdf',
    filename: 'users.pdf',
  },
}

exports.getAll = async (req, res, next) => {
  try {
    const result = await userService.getAll()
    return response(res, 200, 'Success', 'Success get all users', result)
  } catch (error) {
    next(error)
  }
}

exports.export = async (req, res, next) => {
  try {
    const cfg = EXPORTS[req.query.type]
    if (!cfg) {
      throw new ValidationError('Invalid export type, use "excel" or "pdf"')
    }
    const buffer = await userService[cfg.method]()
    res.setHeader('Content-Type', cfg.type)
    res.setHeader('Content-Disposition', `attachment; filename="${cfg.filename}"`)
    return res.send(Buffer.from(buffer))
  } catch (error) {
    next(error)
  }
}
