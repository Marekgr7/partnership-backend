const Boom = require('@hapi/boom');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const User = require('../models/user');
const Owner = require('../models/owner');

const generateRefLink = () => {
  return Date.now().toString();
};

const checkIfUserExist = async () => {
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        throw Boom.badImplementation('Could not create an account, please try again later');
    }

    if (existingUser) {
        throw Boom.forbidden('User already exists. Please log in instead');
    }
}


const signup = async (req, h) => {
    const { email, password, referralLink } = req.payload;

    if (referralLink) {
        console.log('positive if');
        let refOwner;
        try {
            refOwner = await Owner.findOne({ referralLink });
        } catch (error) {
            throw Boom.badImplementation('Could not create an account, please try again');
        }

        let existingUser;
        try {
            existingUser = await User.findOne({ email: email });
        } catch (err) {
            throw Boom.badImplementation('Could not create an account, please try again later');
        }

        if (existingUser) {
            throw Boom.forbidden('User already exists. Please log in instead');
        }

        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 12);
        } catch (err) {
            throw Boom.badImplementation('Could not create an account, please try again later');
        }

        const createdUser = new User({
            email,
            password,
            isOwner: true,
        });

        let refLink;
        try {
            refLink = generateRefLink();
        } catch (err) {
            throw Boom.badImplementation('Could not create an account, please try again later');
        }

        const newOwner = new Owner({
            owner: null,
            referralLink: refLink,
            users: [],
            accountsCreatedByRef: []
        });
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdUser.save({ session: sess });
            refOwner.accountsCreatedByRef.push(createdUser);
            await refOwner.save({ session: sess });

            newOwner.owner = createdUser._id;
            await newOwner.save({ session: sess });
            await sess.commitTransaction();

        } catch (err) {
            throw Boom.badImplementation('Could not create an user please try again');
        }

        return { user: createdUser };
    } else {

        console.log('negative if');

        let existingUser;
        try {
            existingUser = await User.findOne({ email: email });
        } catch (err) {
            throw Boom.badImplementation('Could not create an account, please try again later');
        }

        if (existingUser) {
            throw Boom.forbidden('User already exists. Please log in instead');
        }

        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 12);
        } catch (err) {
            throw Boom.badImplementation('Could not create an account, please try again later');
        }

        const createdUser = new User({
            email,
            password,
            isOwner: true,
        });

        let refLink;
        try {
            refLink = generateRefLink();
        } catch (err) {
            throw Boom.badImplementation('Could not create an account, please try again later');
        }

        const newOwner = new Owner({
            owner: null,
            referralLink: refLink,
            users: [],
            accountsCreatedByRef: []
        });
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdUser.save({ session: sess });
            newOwner.owner = createdUser._id;
            newOwner.users.push(createdUser._id);
            await newOwner.save({ session: sess });
            await sess.commitTransaction();

        } catch (err) {
            console.log(err);
            throw Boom.badImplementation('Could not create an user please try again');
        }

        return { user: createdUser };

    }
};

const signupSubaccount = async (req, h) => {
    const { email, password, ownerId } = req.payload;

    let existingUser;

    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        throw Boom.badImplementation('Could not create an account, please try again later');
    }

    if (existingUser) {
        throw Boom.forbidden('User already exists. Could not register new account');
    }

    let hashedPassword;

    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        throw Boom.badImplementation('Could not create an account, please try again later');
    }

    const createdUser = new User({
        email,
        password: hashedPassword,
        owner: ownerId,
        isOwner: false
    });

    let owner;
    try {
        owner = await Owner.findOne({ owner: ownerId });
    } catch (err) {
        throw Boom.notFound('Cannot create an account. Please try again');
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdUser.save({ session: sess });
        owner.users.push(createdUser._id);
        await owner.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err);
        throw Boom.badImplementation('Cannot create an account, please try again');
    }

    return { user: createdUser };
};

exports.signup = signup;
exports.signupSubaccount = signupSubaccount;