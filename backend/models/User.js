const { model, Schema } = require('mongoose');

// SAMPLE USER SCHEMA MODEL
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

module.exports = model('User', UserSchema);