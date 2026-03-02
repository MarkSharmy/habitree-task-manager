const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true},
    color: { type: String, default: '#3b82f6'}
});

module.exports = mongoose.model('Group', GroupSchema);