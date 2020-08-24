const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const routerTasks = require('./api/routes/tasks');
const routerIndex = require('./api/routes/index');
const routerUsers = require('./api/routes/users');
const routerProject = require('./api/routes/projects');

mongoose.connect("mongodb+srv://mihzas:toor@cluster0.9qulq.mongodb.net/todoList?retryWrites=true&w=majority",{
  useNewUrlParser: true,
  useUnifiedTopology: true 
});

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/public', express.static('public'));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Header', 'Origin, X-Requested, Content-Type, Accept, Authorization');
  if(req.method === 'OPTION') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

app.use('/', routerIndex);
app.use('/tasks', routerTasks);
app.use('/users', routerUsers);
app.use('/projects', routerProject);


app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;