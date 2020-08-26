const Users = require('../models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signUp = (req, res, next) => {
    const email = req.body.email;
    if(email.search(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/) !== -1){
        Users.find({email: email})
        .exec()
        .then(users => {
            if(users.length){
                res.status(409).json({
                    message: 'Mail exists'
                })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if(err){
                        res.status(500).json({error: err})
                    } else {
                        const user = new Users({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                        user
                        .save()
                        .then(result => {
                            res.status(201).json({
                                message: "User has been created"
                            })
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err
                            })
                        })
                    }
                });
            }
        })
    } else {
        return res.status(400).json({
            message: "Wrong format of email"
        })
    }
};

exports.signIn = (req, res, next) => {
    const email = req.body.email;
    if(email.search(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/) !== -1){
        Users.find({email: email})
        .exec()
        .then(users => {
            if(users.length < 1){
                return res.status(401).json({
                    message: 'Auth failed'
                })
            }
            bcrypt.compare(req.body.password, users[0].password, 
                (err, result) => {
                    if(err){
                        return res.status(401).json({
                            message: 'Auth failed'
                        })
                    }
                    if(result) {
                        const token = jwt.sign({
                            email: users[0].email,
                            userId: users[0]._id
                        }, 'secret', {expiresIn: "24h"});

                        return res.status(200).json({
                            message: "Auth success",
                            token: token
                        })
                    }
                    return res.status(401).json({
                        message: "Auth failed"
                    });
                });
        })
        .catch(err => {
            return res.status(500).json({
                error: err
            })
        });
    } else {
        return res.status(400).json({
            message: "Wrong format of email"
        });
    }
}

exports.getCurrentUser = (req, res, next) => {
    Users.findOne({_id: req.userData.userId})
    .exec()
    .then(user => {
        return res.status(200).json({
            message: "OK"
        })
    })
    .catch(err => {
        return res.status(500).json({
            error: err
        });
    });
}