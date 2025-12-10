const express = require('express');
const router = express.Router();
const tasksCtrl = require('../controllers/tasks.controller');
const auth = require('../middlewares/auth');

router.use(auth); // todas as rotas abaixo precisam de auth

router.get('/', tasksCtrl.getTasks); // busca por token (userId do token)
router.post('/', tasksCtrl.createTask);
router.put('/:id', tasksCtrl.updateTask);
router.delete('/:id', tasksCtrl.deleteTask);

module.exports = router;
