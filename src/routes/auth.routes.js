const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth');

// Rotas públicas
router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.post('/refresh-token', authCtrl.refreshToken);

// Rotas protegidas
router.post('/logout', authMiddleware, authCtrl.logout);
router.get('/verificar-token', authMiddleware, authCtrl.verificarToken);

module.exports = router;