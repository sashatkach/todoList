const express = require('express');
const path = require('path');
const routerIndex = express.Router();

routerIndex.get('/', (req, res, next) => {
    res.sendFile('index.html', 
    {root: path.join(__dirname, '../../views')});
});

module.exports = routerIndex;