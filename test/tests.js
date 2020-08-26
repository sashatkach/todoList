const mongoose = require('mongoose');
const Tasks = require('../api/models/task');
const Projects = require('../api/models/project');
const Users = require('../api/models/user');
const bcrypt = require('bcrypt');
const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');
const fetch = require("node-fetch");
const { ObjectId } = require('mongodb');

chai.use(chaiHttp);

const userData = {email: 'testuser@gmail.com', password: '123'}
let token = null;
let createdUser = null;



async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST', 
    mode: 'cors', 
    cache: 'no-cache', 
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow', 
    referrerPolicy: 'no-referrer', 
    body: JSON.stringify(data) 
  });
  return await response.json(); 
}

describe('test all backend functionality', () => {
  before((done) => {
    Users.remove({}, (err)=>{
      bcrypt.hash(userData.password, 10, (err, hash) => {
        createdUser = new Users({
            _id: new mongoose.Types.ObjectId(),
            email: userData.email,
            password: hash
        });

        createdUser
        .save()
        .then(user => {
          postData('http://localhost:3000/users/signin', {email: userData.email, password: userData.password})
          .then(res => {
            token = res.token
            Tasks.remove({user: user}, (err) => { 
              done()
            });
          })
          .catch()  
        })
        .catch()
      });
    })
  });
  
  describe('/GET projects', () => {
    it('it should GET all the projects', (done) => {
      chai.request(server)
          .get('/projects')
          .set('authorization', 'Bearer ' + token)
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('array');
              res.body.length.should.be.eql(0);
            done();
          });
      });
  });

  describe('/GET tasks', () => {
      it('it should GET all the tasks', (done) => {
        chai.request(server)
            .get('/tasks')
            .set('authorization', 'Bearer ' + token)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(0);
              done();
            });
      });
  });
  
  describe('/POST tasks', () => {
    it('it should not POST a task without field done', (done) => {
      const task = {
        name: "Another name of super task",
        deadline: "2020-08-23T18:17:24.959+00:00",
        priority: 10,
      }
      chai.request(server)
          .post("/tasks")
          .set("authorization", "Bearer " + token)
          .send(task)
          .end((err, res) => {
              res.should.have.status(400);
              res.body.should.be.a('object');
              res.body.should.have.property('message');
              res.body.message.should.be.eql("Validation of request data fails or invalid field of request");
            done();
          });
    });

    it('it should POST a task ', (done) => {
      const task = {
        name: "Another name of super task",
        deadline: "2020-08-23T18:17:24.959+00:00",
        projectId: "5f3fe81afa6e7a4fc719f799",
        done: false,
      }

      chai.request(server)
          .post('/tasks')
          .set("authorization", "Bearer " + token)
          .send(task)
          .end((err, res) => {
              res.should.have.status(201);
              res.body.should.be.a('object');
              res.body.should.have.property('message').eql('OK');
              res.body.should.have.property('id')
            done();
          });
    });

    describe('/POST project', () => {
      it('it should POST a project ', (done) => {
        const task = {
          name: "Another name of super project"
        }
  
        chai.request(server)
            .post('/projects')
            .set("authorization", "Bearer " + token)
            .send(task)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('OK');
                res.body.should.have.property('id')
              done();
            });
      });

  describe('/GET/:id task', () => {
    it('it should GET a task by the given id', (done) => {
      const projectObject = new Projects({
        _id: new mongoose.Types.ObjectId(),
        name: "test",
        user: createdUser
      });

      const taskObject = new Tasks({
        _id: new mongoose.Types.ObjectId(),
        name: "Another name of super task",
        deadline: "2020-08-23T18:17:24.959+00:00",
        done: false,
        priority: 10,
        projectId: projectObject,
        user: createdUser,
      });

      projectObject
      .save()
      .then(project => {
        taskObject
        .save()
        .then(task => {
          chai.request(server)
          .get('/tasks/' + task._id)
          .set("authorization", "Bearer " + token)
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('name');
              res.body.should.have.property('deadline');
              res.body.should.have.property('done');
              res.body.should.have.property('priority');
              res.body.should.have.property('projectId');
              res.body.should.have.property('user');
              res.body.should.have.property('_id').eql(task.id);
            done();
            })
          })
          .catch()
        })
        .catch()
      })
    });
  })

  describe('/GET/:id project', () => {
    it('it should GET a project by the given id', (done) => {
      const projectObject = new Projects({
        _id: new mongoose.Types.ObjectId(),
        name: "test",
        user: createdUser
      });

      projectObject
      .save()
      .then(project => {
        chai.request(server)
          .get('/projects/' + project.id)
          .set("authorization", "Bearer " + token)
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('name');
              res.body.should.have.property('user');
              res.body.should.have.property('_id').eql(project.id);
            done();
          })
        })
        .catch()
    })
  });

  
  describe('/PUT/:id task', () => {
    it('it should UPDATE a task given the id', (done) => {
      const projectObject = new Projects({
        _id: new mongoose.Types.ObjectId(),
        name: "test",
        user: createdUser
      });

      const taskObject = new Tasks({
        _id: new mongoose.Types.ObjectId(),
        name: "Another name of super task",
        deadline: "2020-08-23T18:17:24.959+00:00",
        done: false,
        priority: 10,
        projectId: projectObject,
        user: createdUser,
      });

      projectObject
      .save()
      .then(project => {
        taskObject
        .save()
        .then(task => {
          chai.request(server)
          .put('/tasks/' + task._id)
          .set("authorization", "Bearer " + token)
          .send([
            {propName: "name", value: "another another super duper task"}, 
            {propName: "deadline", value: "2020-09-23T18:17:24.959+00:00"}, 
            {propName: "done", value: "true"},
            {propName: "priority", value: "20"},
            {propName: "projectId", value: project._id+""}
          ])
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('OK');
            res.body.result.should.have.property('ok').eql(1);
            res.body.result.should.have.property('n').eql(1);
            done();
            })
          })
          .catch()
        })
        .catch()
    })
  });

  describe('/PUT/:id project', () => {
    it('it should UPDATE a project given the id', (done) => {
      const projectObject = new Projects({
        _id: new mongoose.Types.ObjectId(),
        name: "test",
        user: createdUser
      });

      projectObject
      .save()
      .then(project => {
        chai.request(server)
        .put('/tasks/' + project._id)
        .set("authorization", "Bearer " + token)
        .send([
          {propName: "name", value: "another another super duper project"}
        ])
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.result.should.have.property('ok').eql(1);
          res.body.result.should.have.property('n').eql(0);
          done();
          })
        })
        .catch() 
      })
  });

  describe('/DELETE/:id task', () => {
    it('it should DELETE a task given the id', (done) => {
      const projectObject = new Projects({
        _id: new mongoose.Types.ObjectId(),
        name: "test",
        user: createdUser
      });

      const taskObject = new Tasks({
        _id: new mongoose.Types.ObjectId(),
        name: "Another name of super task",
        deadline: "2020-08-23T18:17:24.959+00:00",
        done: false,
        priority: 10,
        projectId: projectObject,
        user: createdUser,
      });

      projectObject
      .save()
      .then(project => {
        taskObject
        .save()
        .then(task => {
          chai.request(server)
          .delete('/tasks/' + task._id)
          .set("authorization", "Bearer " + token)
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('message').eql('OK');
              res.body.result.should.have.property('ok').eql(1);
              res.body.result.should.have.property('n').eql(1);
              done();
            })
          })
          .catch()
        })
        .catch()
    })
  });

  describe('/DELETE project', () => {
    it('it should DELETE a project given the id', (done) => {
      const projectObject = new Projects({
        _id: new mongoose.Types.ObjectId(),
        name: "test",
        user: createdUser
      });

      projectObject
      .save()
      .then(project => {
        chai.request(server)
        .delete('/projects/' + project._id)
        .set("authorization", "Bearer " + token)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.message.should.eql("OK");
            res.body.result.should.have.property('ok').eql(1);
            res.body.result.should.have.property('n').eql(1);
            done();
          })
        })
        .catch()
      })
    });
  })

  describe('/SIGNUP users', () => {
    it('it should signup a user', (done) => {

      chai.request(server)
        .post('/users/signup')
        .send({email: "qwerty12345@gmail.com", password: "123"})
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.message.should.eql("User has been created");
          done();
        })

    })
  })

  describe('/SIGNIN users', () => {
    it('it should signin a user', (done) => {
      let newUser = null;

      bcrypt.hash("123", 10, (err, hash) => {
        newUser = new Users({
        _id: new mongoose.Types.ObjectId(),
        email: 'qwerty@gmail.com',
        password: hash
      });
        
      newUser
      .save()
      .then(project => {
        chai.request(server)
        .post('/users/signin')
        .send({email: "qwerty@gmail.com", password: "123"})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.message.should.eql("Auth success");
          res.body.should.have.property("token");
          done();
        })
      })
      .catch()
      })
    })
    
  })
})

