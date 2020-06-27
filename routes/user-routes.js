const Joi = require('@hapi/joi');

const userCtrl = require('../controllers/user-controller');
const createUserSchema = require('../schemas/createUser');

exports.plugin = {
    async register(server, options) {
        server.route([
            {
                method: 'POST',
                path: '/users/signup/subaccount',
                options: {
                    description: 'Sign up an subaccount',
                    handler: userCtrl.signupSubaccount
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
                    handler: userCtrl.signup
                }
            }
        ]);
    },
    version: require('../package.json').version,
    name: 'route-users'
};