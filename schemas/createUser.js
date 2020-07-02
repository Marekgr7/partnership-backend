'use strict';

const Joi = require('@hapi/joi');

const createUserSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().regex(/((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,64})/).required(),
    isPartnership: Joi.optional(),
    referralLink: Joi.string().optional()
});

module.exports = createUserSchema;