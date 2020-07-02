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
        throw Boom.badImplementation('Wystapił problem. Proszę spróbuj ponownie');
    }

    if (existingUser) {
        throw Boom.forbidden('Użytkownik już istnieje. Zaloguj się !');
    }
}

const hashPassword = async (password) => {
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        throw Boom.badImplementation('Wystapił problem. Proszę spróbuj ponownie');
    }
    return hashedPassword;
};


const signup = async (req, h) => {
    let {email, password, referralLink, isPartnership} = req.payload;

    if (isPartnership === undefined) {
        isPartnership = false;
    }

    console.log(email);
    console.log(password);
    console.log(isPartnership);

    if (referralLink) {
        console.log('positive if');
        let refGroup;
        try {
            refGroup = await Group.findOne({ referralLink });
        } catch (error) {
            throw Boom.badImplementation('Wystapił problem. Proszę spróbuj ponownie');
        }

        if(!refGroup) {
            throw Boom.notFound('Link do poleceń jest nie prawidłowy !');
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
            throw Boom.badImplementation('Wystapił problem. Proszę spróbuj ponownie');
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
            newGroup.users.push(createdUser._id);
            newGroup.owner = createdUser._id;
            await newGroup.save({session: sess});
            createdUser.group = newGroup._id;
            await createdUser.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            throw Boom.badImplementation('Wystapił problem. Proszę spróbuj ponownie');
        }

        let token;
        try {
            token = createToken(createdUser);
        } catch (err) {
            throw Boom.badImplementation('Wystapił problem. Proszę spróbuj ponownie');
        }

        return {
            userId: createdUser.id,
            email: createdUser.email,
            token: token,
            isPartnership: newGroup.isPartnership,
            isOwner: true
        };

    } else {

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
            throw Boom.badImplementation('Wystapił problem. Proszę spróbuj ponownie');
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
            throw Boom.badImplementation('Wystapił problem. Proszę spróbuj ponownie');
        }

        let token;
        try {
            token = createToken(createdUser);
        } catch (err) {
            throw Boom.badImplementation('Wystapił problem. Proszę spróbuj ponownie');
        }

        return {
            userId: createdUser.id,
            email: createdUser.email,
            token: token,
            isPartnership: newGroup.isPartnership,
            isOwner: true
        };
    }
};

const signupSubaccount = async (req, h) => {
    const {email, password, ownerId} = req.payload;

    let existingUser;

    try {
        existingUser = await User.findOne({email: email});
    } catch (err) {
        throw Boom.badImplementation('Wystapił problem. Proszę spróbuj ponownie');
    }

    if (existingUser) {
        throw Boom.forbidden('Podany email jest zajęty ');
    }

    let hashedPassword;

    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        throw Boom.badImplementation('Wystapił problem. Proszę spróbuj ponownie');
    }


    let group;
    try {
        group = await Group.findOne({owner: ownerId});
    } catch (err) {
        throw Boom.badImplementation('Wystapił problem. Proszę spróbuj ponownie');
    }

    if (!group) {
        throw Boom.notFound('Wystapił problem. Proszę spróbuj ponownie');
    }

    const createdUser = new User({
        email,
        password: hashedPassword,
        isOwner: false,
        group: group._id
    });


    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdUser.save({ session: sess });
        group.users.push(createdUser._id);
        await group.save( {session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err);
        throw Boom.badImplementation('Wystapił problem. Proszę spróbuj ponownie');
    }

    return {user: createdUser._id, email: createdUser.email};
};


const login = async (req, h) => {
    const {email, password} = req.payload;

    console.log('loginng');

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email }).populate('group');
    } catch (err) {
        throw Boom.badImplementation('Logowanie nie powiodło się. Prosze spróbuj ponownie');
    }

    console.log(existingUser.group);

    if (!existingUser) {
        throw Boom.forbidden('Błedny login lub hasło. Spróbuj ponownie');
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        throw Boom.badImplementation('Logowanie nie powiodło się. Prosze spróbuj ponownie');
    }

    if (!isValidPassword) {
        throw Boom.forbidden('Błedny login lub hasło. Spróbuj ponownie');
    }

    let token;
    try {
        token = createToken(existingUser);
    } catch (err) {
        throw Boom.badImplementation('Logowanie nie powiodło się. Prosze spróbuj ponownie');
    }
    return {
        userId: existingUser.id,
        email: existingUser.email,
        token: token,
        isPartnership: existingUser.group.isPartnership,
        isOwner: existingUser.isOwner
    };
};


exports.signup = signup;
exports.signupSubaccount = signupSubaccount;
exports.login = login;