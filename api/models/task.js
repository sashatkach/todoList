const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true},
    deadline: {type: Date,  required: true},
    priority: {type: Number,  required: true},
    done: {type: Boolean, required: true},
    projectId: {type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Task', taskSchema);

