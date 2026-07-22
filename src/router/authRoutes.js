const express = require('express')
const router = express.Router()
const authController = require('../controller/authController')
const { authMiddleware } = require('../middleware/authMiddleware')

router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/identify', authMiddleware, authController.identify)
router.post('/refresh', authController.refresh)
router.post('/logout', authMiddleware, authController.logout)

module.exports = router
