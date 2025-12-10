const express = require('express');
const router = express.Router();
const pomCtrl = require('../controllers/pomodoro.controller');
const auth = require('../middlewares/auth');

router.use(auth);

router.post('/start', pomCtrl.startSession);
router.post('/end', pomCtrl.endSession);
router.get('/history', pomCtrl.getHistory);

module.exports = router;
