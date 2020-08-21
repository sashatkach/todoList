// const mysql = require("mysql2");
// const express = require('express')
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const app = express();
// const port = 3000;

// const connection = () => {
//   return mysql.createConnection({
//     host: "localhost",
//     user: "mihzas",
//     database: "testWeb",
//     password: "toor",
//     //dateStrings: 'date',
//   });
// };

// app.use(cors());


// // Configuring body parser middleware
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());


// app.use('/public', express.static('public'));
// app.set('view engine', 'ejs');


// app.get('/', function(req, res){
//     res.render('index.ejs');
// });

// app.get('/index', function(req, res){
//     res.render('index.ejs');
// });

// app.get('/tasks', function(req, res){
//   const db = connection();
//   db.query("SELECT * FROM tasks;",
//       function(err, tasks, fields) {
//         if(err)
//         {
//           res.json({"error": err});
//         }
//         res.json({"result": tasks});
//       });
//   db.end();
    
// });

// app.post('/tasks', function(req, res){
//   const newTask = req.body.text;
//   const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
//   const db = connection();
//   db.query(`INSERT INTO tasks(id, message, priority, deadline, done) VALUES(1, "${newTask}", 10, "${date}", false)`,
//       function(err, result, fields) {
//         if(err)
//         {
//           res.json({"error": err});
//         }
//         res.json({"result": result});
//       });
//   db.end();
  
// });

// app.delete('/tasks/:id', function(req, res){
//   const id = req.params.id;
//   const db = connection();
//   db.query(`DELETE FROM tasks WHERE id=${id}`,
//       function(err, result, fields) {
//         if(err)
//         {
//           res.json({"error": err});
//         }
//         res.json({"result": result});
//       });
//   db.end();
  
// });

// app.delete('/tasks', function(req, res){
//   const db = connection();
//   db.query(`DELETE FROM tasks`,
//       function(err, result, fields) {
//         if(err)
//         {
//           res.json({"error": err});
//         }
//         res.json({"result": result});
//       });
//   db.end();
// });

// app.put('/tasks/:id', function(req, res){
//   const id = req.params.id;
//   const updateTask = req.body.text;
//   const db = connection();
//   db.query(`UPDATE tasks SET message="${updateTask}" WHERE id=${id}`,
//       function(err, result, fields) {
//         if(err)
//         {
//           res.json({"error": err});
//         }
//         res.json({"result": result});
//       });
//   db.end();
// });

// app.post('/signup', function(){
//   const user = new User({

//   });
// });

// app.listen(port, ()=>{console.log(`App is running on ${port} port`)});
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
// app.set('view engine', 'ejs');

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