const Projects = require('../models/project');
const Users = require('../models/user');
const mongoose = require('mongoose');

exports.getAllProjects = (req, res, next) => {
    Projects.find({user: req.userData.userId})
    .select('name _id')
    .exec()
    .then(projects => {
        res.status(200).json(projects);
    })
    .catch(err => {
        return res.status(500).json({
            error: err
        });
    });
}

exports.getByIdProject = (req, res, next) => {
    const id = req.params.idProject;
    Projects.findOne({_id: id, user: req.userData.userId})
    .exec()
    .then(doc => {
        if(doc)
        {
            return res.status(200).json(doc);
        }
        return res.status(404).json({message: "No valid entry foun for provided ID"});
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({error: err});
    });
}

exports.createProject = (req, res, next) => {
    const name = req.body.name;
    if(name !== "" && name.search(/^[а-яА-ЯёЁa-zA-Z0-9 ,!?]+$/) !== -1){
        Users.findById(req.userData.userId)
        .exec()
        .then(user => {
            const project = new Projects({
                _id: new mongoose.Types.ObjectId(),
                name: name,
                user: user,
            });
            project
                .save()
                .then(result => {
                    return res.status(201)
                    .json({
                        message: 'OK',
                        id: project._id 
                    });
                })
                .catch(err => {
                    return res.status(206).json({
                        message: 'Field invalid'
                    })
                });
            
        })   
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        })
    } else {
        return res.status(400).json({
            message: "Name invalid"
        })
    }
}
exports.updateProject = (req, res, next) => {
    const id = req.params.idProject;
    const updateOps = {};

    for(const ops of req.body){
        if(ops.propName === 'name' && ops.value === "" || ops.value.search(/^[а-яА-ЯёЁa-zA-Z0-9 ,!?]+$/) === -1){
            return res.status(400).json({
                message: "Name invalid"
            })
        }
        updateOps[ops.propName] = ops.value
    }

    Projects.update({_id:id, user: req.userData.userId}, {$set: updateOps})
    .exec()
    .then(result => {
        res.status(200).json(result);
    })
    .catch(err => {
        res.status(500).json({
            error: err,
        })
    });
}

exports.deleteProject = (req, res, next) => {
    const id = req.params.idProject;
    Projects.remove({_id: id, user: req.userData.userId})
    .exec()
    .then(result => {
        res.status(200).json({
            message: "OK",
            result: result,
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    });
};