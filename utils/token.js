'use strict';

const jwt = require('jsonwebtoken');
const userInfo = require('../personal/PersonalData');

const createToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email} , userInfo.secretJwt, {
        algorithm: 'HS256',
        expiresIn: '1h'
    });
};

module.exports = createToken;