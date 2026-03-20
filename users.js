const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    father_name: { type: String, required: true },
    grandfather_name: { type: String, required: true },
    email: { type: String },
    nationality: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true } 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);