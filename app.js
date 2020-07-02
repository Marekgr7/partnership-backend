'use strict';

const Hapi = require('@hapi/hapi');
const mongoose = require('mongoose');

const PersonalData = require('./personal/PersonalData')

const validate = async (decoded, request) => {
    return { isValid: true };
};

const init = async () => {

    const server = Hapi.server({
        port: 5000,
        host: 'localhost',
        routes: {
            cors: true
        }
    });

    await server.register({
        plugin: require('./plugins/logger')
    })

    server.realm.modifiers.route.prefix = '/api';

    await server.register(require('hapi-auth-jwt2'));
    server.auth.strategy('jwt', 'jwt', {
        key: PersonalData.secretJwt,
        validate,
        verifyOptions: { algorithms : [ 'HS256' ] }
    });

    await server.register({
        plugin: require('./routes/user-routes')
    });

    await server.register({
        plugin: require('./routes/partnership-routes')
    });

    await server.start();
    console.log('Server is running on %s', server.info.uri);
}

mongoose
    .connect(
        PersonalData.mongoUrl
    )
    .then(() => {
        init();
    })
    .catch(err => {
        console.log(err);
    });