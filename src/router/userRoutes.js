const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const { authMiddleware } = require('../middleware/authMiddleware')

router.get('/', authMiddleware, userController.getAll)
router.get('/export', authMiddleware, userController.export)

module.exports = router
