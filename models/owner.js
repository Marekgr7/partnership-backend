const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const ownerSchema = Schema({
    owner: { type: mongoose.Types.ObjectId, ref: 'User' },
    referralLink: { type: String, required: false, unique: true },
    users: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    accountsCreatedByRef: [{ type: mongoose.Types.ObjectId, required: false, ref: 'User' }]
});

ownerSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Owner', ownerSchema);
