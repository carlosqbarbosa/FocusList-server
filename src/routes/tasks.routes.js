const express = require('express');
const router = express.Router();
const tasksCtrl = require('../controllers/tasks.controller');
const auth = require('../middlewares/auth');

router.use(auth); 

router.get('/', tasksCtrl.getTasks); 
router.post('/', tasksCtrl.createTask);
router.put('/:id', tasksCtrl.updateTask);
router.delete('/:id', tasksCtrl.deleteTask);

module.exports = router;
