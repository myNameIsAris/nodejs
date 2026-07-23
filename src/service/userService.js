const ExcelJS = require('exceljs')
const PDFDocument = require('pdfkit')
const { usersModel } = require('../model/relation')

const COLUMNS = [
  { header: 'ID', key: 'id', width: 40 },
  { header: 'Name', key: 'name', width: 25 },
  { header: 'Username', key: 'username', width: 20 },
  { header: 'Email', key: 'email', width: 30 },
  { header: 'Created At', key: 'created_at', width: 25 },
]

class UserService {
  getAll() {
    return usersModel.findAll({
      attributes: { exclude: ['password', 'version'] },
      raw: true,
    })
  }

  async exportExcel() {
    const users = await this.getAll()

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Users')
    sheet.columns = COLUMNS
    sheet.getRow(1).font = { bold: true }
    sheet.addRows(users)

    return workbook.xlsx.writeBuffer()
  }

  async exportPdf() {
    const users = await this.getAll()

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 30, size: 'A4' })
      const chunks = []
      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      doc.fontSize(16).text('Users', { align: 'center' }).moveDown()
      doc.fontSize(10)
      users.forEach((user, i) => {
        doc.text(`${i + 1}. ${user.name} (${user.username}) - ${user.email}`)
      })

      doc.end()
    })
  }
}

module.exports = new UserService()
