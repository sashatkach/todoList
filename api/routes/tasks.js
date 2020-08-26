const express = require('express');
const Tasks = require('../models/task');
const Users = require('../models/user');
const routerTasks = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

routerTasks.get('/', checkAuth, (req, res, next) => {
    Tasks.find({user: req.userData.userId})
    .populate('projectId', 'name')
    .populate('user', 'email')
    .select('name deadline priority done')
    .exec()
    .then(docs => {
        return res.status(200).json(docs);
    })
    .catch(err => {
        return res.status(500).json({
            error: err
        });
    });
});

routerTasks.get('/:idTask', checkAuth, (req, res, next) => {
    const id = req.params.idTask;
    Tasks.findOne({_id: id, user: req.userData.userId})
        .populate('projectId', 'name')
        .populate('user', 'email')
        .select('name deadline priority done')
        .exec()
        .then(doc => {
            if(doc)
            {
                return res.status(200).json(doc);
            }
            return res.status(404).json({message: "No valid entry foun for provided ID"});
        })
        .catch(err => {
            return res.status(500).json({error: err});
        });
});

routerTasks.post('/', checkAuth, (req, res, next) => {
    const name = req.body.name;
    const deadline = req.body.deadline;
    const done = req.body.done;
    const projectId = req.body.projectId;
    let priority = 1;

    const [date, time] = deadline.split('T');
    console.log(date, time);
    if(name !== '' && name.search(/^[а-яА-ЯёЁa-zA-Z0-9 ,!?]+$/) !== -1
    && ((deadline !== '' && (date.search(/\d{1,2}-\d{1,2}-\d{4}/) !== -1 
    || date.search(/\d{4}-\d{1,2}-\d{1,2}/) !== -1)) && time.search(/\d{1,2}:\d{2}([ap]m)?/) !== -1)
    && Number.isInteger(priority) && typeof(done) === 'boolean'){
        Users.findOne({_id: req.userData.userId})
        .exec()
        .then(user => {
            Tasks.find({projectId: projectId})
            .exec()
            .then(tasks => {
                if(tasks.length){
                    tasks = tasks.sort((o1, o2) => {
                        return o1.priority - o2.priority;
                    })
                    priority = tasks[tasks.length - 1].priority + 1
                }

                const task = new Tasks({
                    _id: new mongoose.Types.ObjectId(),
                    name: name,
                    deadline: deadline, 
                    priority: priority, 
                    done: done, 
                    projectId: projectId,
                    user: user,
                });
            
                task
                    .save()
                    .then(task => {
                        return res.status(201).json({
                            message: "OK",
                            id: task._id
                        })
                    })
                    .catch(err => {
                        return res.status(206).json({
                            message: "invalid field of request"
                        })
                    });
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    } else {
        return res.status(400).json({
            message: "Validation of request data fails",
        });
    }
});

routerTasks.put('/:idTask', checkAuth, (req, res, next) => {
    const id = req.params.idTask;
    const updateOps = {};

    for(const ops of req.body){
        let [date, time] = ['', ''];
        if(ops.propName === 'name' && (ops.value === '' || ops.value.search(/^[а-яА-ЯёЁa-zA-Z0-9 ,!?]+$/) === -1)){
            return res.status(400).json({
                message: 'Name invalid'
            });
        }

        if(ops.propName === 'deadline'){
            [date, time] = ops.value.split('T');
        }
        if(ops.propName === 'deadline' && ((ops.value === '' || (date.search(/\d{1,2}-\d{1,2}-\d{4}/) === -1 
            && date.search(/\d{4}-\d{1,2}-\d{1,2}/) === -1)) || time.search(/\d{1,2}:\d{2}([ap]m)?/)) === -1){
                return res.status(400).json({
                    message: 'Deadline invalid'
                });
        }

        if(ops.propName === 'priority' && !Number.isInteger(ops.value)){
            return res.status(400).json({
                message: 'Priority invalid'
            })
        }

        if(ops.propName === 'done' && typeof(done) === 'boolean'){
            return res.status(400).json({
                message: 'Done invalid',
            })
        }
        updateOps[ops.propName] = ops.value;
    }

    Tasks.updateOne({_id:id, user:req.userData.userId}, {$set: updateOps})
    .exec()
    .then(result => {
        return res.status(200).json({
            message: "OK",
            result: result,
        });
    })
    .catch(err => {
        return res.status(500).json({
            error: err,
        })
    });
});

routerTasks.delete('/:idTask', checkAuth, (req, res, next) => {
    const id = req.params.idTask;
    Tasks.remove({_id: id, user: req.userData.userId})
    .exec()
    .then(result => {
        return res.status(200).json({
            message: "OK",
            result: result,
        });
    })
    .catch(err => {
        return res.status(500).json({
            error: err
        })
    });
});

module.exports = routerTasks;