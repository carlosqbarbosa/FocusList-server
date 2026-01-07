// Agregador de rotas
const express = require('express')
const router = express.Router()

const authRoutes = require('./auth.routes')
const userRoutes = require('./user.routes')
const taskRoutes = require('./tasks.routes')
const dashboardRoutes = require('./dashboard.routes')
const pomodoroRoutes = require('./pomodoro.routes')
const supportRoutes = require('./support.routes')

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/tasks', taskRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/pomodoro', pomodoroRoutes)
router.use('/support', supportRoutes)

module.exports = router
