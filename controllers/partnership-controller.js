const Boom = require('@hapi/boom');
const mongoose = require('mongoose');

const User = require('../models/user');
const Group = require('../models/group');


const checkPartnership = async (req, h) => {
    const userId = req.params.userId;

    let existingUser;
    try {
        existingUser = await User.findById(userId).populate('group');
        console.log(existingUser.group);
    } catch (err) {
        throw Boom.badImplementation("Wystapił problem. Proszę spróbuj ponownie");
    }

    if (!existingUser) {
        throw Boom.notFound("Nie znaleziono użytkownika. Proszę spróbuj ponownie");
    }

    return {
        isPartnership: existingUser.group.isPartnership
    };
};

const getRefLink = async (req, h) => {
    const userId = req.params.userId;

    let existingUser;
    try {
        existingUser = await User.findById(userId).populate('group');
    } catch (err) {
        throw Boom.badImplementation("Wystapił problem. Proszę spróbuj ponownie");
    }

    if (!existingUser) {
        throw Boom.notFound("Nie znaleziono użytkownika. Proszę spróbuj ponownie");
    }

    return {
      referral: existingUser.group.referralLink
    };
};

const getRefAccounts = async (req, h) => {
    const userId = req.params.userId;

    let existingUser;
    let group;
    try {
        existingUser = await User.findById(userId).populate('group');
        group = existingUser.group;
        console.log(existingUser.group.accountsCreatedByRef);
    } catch (err) {
        throw Boom.badImplementation("Wystapił problem. Proszę spróbuj ponownie");
    }

    if (!existingUser) {
        throw Boom.notFound("Nie znaleziono użytkownika. Proszę spróbuj ponownie");
    }

    let accountsToSend = [];
    let user;
    try {
        for (let userId of group.accountsCreatedByRef) {
            user = await User.findById(userId, '-password');
            accountsToSend.push(user.email);
        }
    } catch (err) {
      throw Boom.badImplementation("Wystapił problem. Proszę spróbuj ponownie");
    }

    return {
        refAccounts: accountsToSend
    }
};

const setPartnership = async (req, h) => {
    const { partnershipToSet, userId } = req.payload;

    let existingUser;
    try {
        existingUser = await User.findById(userId, '-password');
    } catch (err) {
        throw Boom.badImplementation("Wystapił problem. Proszę spróbuj ponownie");
    }

    let existingGroup;
    try {
        existingGroup = await Group.findById(existingUser.group);
    } catch (err) {
        throw Boom.badImplementation("Wystapił problem. Proszę spróbuj ponownie");
    }

    existingGroup.isPartnership = partnershipToSet;

    try {
        existingGroup.save();
    } catch (err) {
        throw Boom.badImplementation("Wystapił problem. Proszę spróbuj ponownie");
    }

    return {
        isPartnership: existingGroup.isPartnership
    };
};

exports.checkPartnership = checkPartnership;
exports.getRefLink = getRefLink;
exports.getRefAccounts = getRefAccounts;
exports.setPartnership = setPartnership;


