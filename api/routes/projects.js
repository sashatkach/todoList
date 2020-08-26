const express = require('express');
const Projects = require('../models/project');
const Users = require('../models/user');
const routerProject = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const Project = require('../controllers/projects');

routerProject.get('/', checkAuth, Project.getAllProjects);

routerProject.get('/:idProject', checkAuth, Project.getByIdProject);

routerProject.post('/', checkAuth, Project.createProject);

routerProject.put('/:idProject', checkAuth, Project.updateProject);

routerProject.delete('/:idProject', checkAuth, Project.deleteProject);

module.exports = routerProject;