
const options = {
    ops: {
        interval: 1000
    },
    reporters: {
        console: [{
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{
                log: '*',
                response: '*'
            }]
        },
            {
                module: 'good-console'
            }, 'stdout'
        ]
    }
};


exports.plugin = {
    async register(server) {

        await server.register({
            plugin: require('good'),
            options
        });

    },
    version: require('../package.json').version,
    name: 'logger'
};