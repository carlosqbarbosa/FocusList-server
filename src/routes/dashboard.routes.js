const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

router.get('/summary', (req, res) =>
  dashboardController.getSummary(req, res)
);

router.get('/month', (req, res) =>
  dashboardController.getTasksByMonth(req, res)
);

router.get('/tasks-by-month', (req, res) =>
  dashboardController.getTasksByMonth(req, res)
);

router.get('/upcoming', (req, res) =>
  dashboardController.getUpcomingTasks(req, res)
);

router.get('/upcoming-tasks', (req, res) =>
  dashboardController.getUpcomingTasks(req, res)
);

router.get('/overdue', (req, res) =>
  dashboardController.getOverdueTasks(req, res)
);

router.get('/overdue-tasks', (req, res) =>
  dashboardController.getOverdueTasks(req, res)
);

module.exports = router;

