const express = require('express');
const router = express.Router();
const dash = require('../controllers/dashboard.controller');
const auth = require('../middlewares/auth');

router.use(auth);

router.get('/summary', dash.summary);

module.exports = router;
