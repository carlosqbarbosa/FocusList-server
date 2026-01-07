const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

router.get('/perfil', userCtrl.perfil);

router.put('/atualizar', userCtrl.atualizar);

router.put('/alterar-senha', userCtrl.alterarSenha);

router.delete('/deletar', userCtrl.deletar);

module.exports = router;