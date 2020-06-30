const Boom = require('@hapi/boom');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const User = require('../models/user');
const Group = require('../models/group');
const createToken = require('../utils/token');


const generateRefLink = () => {
    return Date.now().toString();
};

const checkIfUserExist = async (email) => {
    let existingUser;
    try {
        existingUser = await User.findOne({email: email});
    } catch (err) {
        throw Boom.badImplementation('Could not create an account, please try again later');
    }

    if (existingUser) {
        throw Boom.forbidden('User already exists. Please log in instead');
    }
}

const hashPassword = async (password) => {
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        throw Boom.badImplementation('Could not create an account, please try again later');
    }
    return hashedPassword;
};


const signup = async (req, h) => {
    const {email, password, referralLink, isPartnership} = req.payload;

    console.log(email);
    console.log(password);
    console.log(isPartnership);

    if (referralLink) {
        console.log('positive if');
        let refGroup;
        try {
            refGroup = await Group.findOne({ referralLink });
        } catch (error) {
            throw Boom.badImplementation('Could not create an account, please try again');
        }

        await checkIfUserExist(email);

        const hashedPassword = await hashPassword(password);

        const createdUser = new User({
            email,
            password: hashedPassword,
            isOwner: true
        });

        let refLink;
        try {
            refLink = generateRefLink();
        } catch (err) {
            throw Boom.badImplementation('Could not create an account, please try again later');
        }

        const newGroup = new Group({
            owner: null,
            referralLink: refLink,
            users: [],
            accountsCreatedByRef: [],
            isPartnership
        });
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdUser.save({session: sess});
            refGroup.accountsCreatedByRef.push(createdUser);
            await refGroup.save({session: sess});

            newGroup.owner = createdUser._id;
            await newGroup.save({session: sess});
            await sess.commitTransaction();

        } catch (err) {
            throw Boom.badImplementation('Could not create an user please try again');
        }

        let token;
        try {
            token = createToken(createdUser);
        } catch (err) {
            throw Boom.badImplementation('Could not log you in. Please try again later');
        }

        return {user: createdUser._id, email: createdUser.email, token: token};

    } else {

        console.log('negative if');

        await checkIfUserExist(email);

        const hashedPassword = await hashPassword(password);

        const createdUser = new User({
            email,
            password: hashedPassword,
            isOwner: true,
            isPartnership
        });

        let refLink;
        try {
            refLink = generateRefLink();
        } catch (err) {
            throw Boom.badImplementation('Could not create an account, please try again later');
        }

        const newGroup = new Group({
            owner: null,
            referralLink: refLink,
            users: [],
            accountsCreatedByRef: [],
            isPartnership
        });

        console.log(newGroup);
        console.log(createdUser);
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdUser.save({ session: sess });
            newGroup.owner = createdUser._id;
            newGroup.users.push(createdUser._id);
            await newGroup.save({ session: sess });
            createdUser.group = newGroup._id;
            await createdUser.save({ session: sess });
            await sess.commitTransaction();

        } catch (err) {
            console.log(err);
            throw Boom.badImplementation('Could not create an user please try again');
        }

        let token;
        try {
            token = createToken(createdUser);
        } catch (err) {
            throw Boom.badImplementation('Could not log you in. Please try again later');
        }

        return {user: createdUser._id, email: createdUser.email, token: token};

    }
};

const signupSubaccount = async (req, h) => {
    const {email, password, ownerId} = req.payload;

    let existingUser;

    try {
        existingUser = await User.findOne({email: email});
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


    let group;
    try {
        group = await Group.findOne({owner: ownerId});
    } catch (err) {
        throw Boom.notFound('Cannot create an account. Please try again');
    }

    const createdUser = new User({
        email,
        password: hashedPassword,
        isOwner: false,
        group: group
    });

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdUser.save({session: sess});
        owner.users.push(createdUser._id);
        await owner.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        console.log(err);
        throw Boom.badImplementation('Cannot create an account, please try again');
    }

    return {user: createdUser._id, email: createdUser.email};
};


const login = async (req, h) => {
    const {email, password} = req.payload;

    let existingUser;
    try {
        existingUser = await User.findOne({email: email});
    } catch (err) {
        throw Boom.badImplementation('Logging in failed, Please try again later');
    }

    if (!existingUser) {
        throw Boom.forbidden('Invalid credentials, could not log you in');
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        throw Boom.badImplementation('Could not log you in. Please try again later');
    }

    if (!isValidPassword) {
        throw Boom.forbidden('Invalid credentials, could not log you in');
    }

    let token;
    try {
        token = createToken(existingUser);
    } catch (err) {
        throw Boom.badImplementation('Could not log you in. Please try again later');
    }
    return {
        userId: existingUser.id,
        email: existingUser.email,
        token: token
    };
};

const checkPartnership = async (req, h) => {

}

exports.signup = signup;
exports.signupSubaccount = signupSubaccount;
exports.login = login;