const Boom = require('@hapi/boom');
const mongoose = require('mongoose');

const User = require('../models/user');
const Group = require('../models/group');


const checkPartnership = async (req, h) => {
    const userId = req.params.userId;

    let existingUser;
    try {
        existingUser = await User.findById(userId);
    } catch (err) {
        throw Boom.badImplementation("Something went wrong please try again");
    }

    if (!existingUser) {
        throw Boom.notFound("User not found. Please try again");
    }

    let group;
    try {
        group = await Group.findById(existingUser.group);
    } catch (err) {
        throw Boom.badImplementation("Something went wrong please try again");
    }

    if (!existingUser) {
        throw Boom.notFound("Company not found. Please try again");
    }

    return {
        isPartnership: group.isPartnership
    };
};

const getRefLink = async (req, h) => {
    const userId = req.params.userId;

    let existingUser;
    try {
        existingUser = await User.findById(userId);
    } catch (err) {
        throw Boom.badImplementation("Something went wrong please try again");
    }

    if (!existingUser) {
        throw Boom.notFound("User not found. Please try again");
    }

    let group;
    try {
        group = await Group.findById(existingUser.group);
    } catch (err) {
        throw Boom.badImplementation("Something went wrong please try again");
    }

    if (!group) {
        throw Boom.notFound("Company not found. Please try again");
    }

    return {
      referral: group.referralLink
    };
};

exports.checkPartnership = checkPartnership;
exports.getRefLink = getRefLink;


