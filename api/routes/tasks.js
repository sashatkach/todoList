const express = require('express');
const routerTasks = express.Router();
const checkAuth = require('../middleware/check-auth');

const TaskController = require('../controllers/tasks');

routerTasks.get('/', checkAuth, TaskController.getAllTasks);

routerTasks.get('/:idTask', checkAuth, TaskController.getByIdTask);

routerTasks.post('/', checkAuth, TaskController.createTask);

routerTasks.put('/:idTask', checkAuth, TaskController.updateTask);

routerTasks.delete('/:idTask', checkAuth, TaskController.deleteTask);

module.exports = routerTasks;