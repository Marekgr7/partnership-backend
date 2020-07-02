const Joi = require('@hapi/joi');

const authCtrl = require('../controllers/auth-controller');
const partnershipCtrl = require('../controllers/partnership-controller');
const createUserSchema = require('../schemas/createUser');

exports.plugin = {
    async register(server, options) {
        server.route([
            {
                method: 'POST',
                path: '/users/signup/subaccount',
                options: {
                    description: 'Sign up an subaccount',
                    handler: authCtrl.signupSubaccount,
                    auth: {
                        strategy: 'jwt'
                    }
                }
            },
            {
                method: 'POST',
                path: '/users/signup',
                options: {
                    description: 'Sign up an master user',
                    // validate: {
                    //     payload: createUserSchema
                    // },
                    handler: authCtrl.signup,
                    validate: {
                        payload: createUserSchema
                    }
                }
            },
            {
                method: 'POST',
                path: '/users/login',
                options: {
                    description: 'Login',
                    handler: authCtrl.login
                }
            }
        ]);
    },
    version: require('../package.json').version,
    name: 'route-users'
};