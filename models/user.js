const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 8 },
    owner: { type: mongoose.Types.ObjectId, required: false, ref: 'Owner'},
    isOwner: { type: Boolean, required: false}
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
