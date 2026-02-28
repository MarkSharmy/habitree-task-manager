const mongoose = require(mongoose);
const bcrypt = require('bcrypt');

const UserSchema = mongoose.Schema({
    username: {type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String,
        enum: ['Master', 'Admin', 'Collaborator'],
        default: 'Admin'
    },
    createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

module.exports = mongoose.model('User', UserSchema);