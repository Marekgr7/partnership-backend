const partnershipCtrl = require('../controllers/partnership-controller');


exports.plugin = {
    async register(server, options) {
        server.route([
            {
                method: 'GET',
                path: '/partnership/check/{userId}',
                options: {
                    description: 'Check partnership of the group',
                    handler: partnershipCtrl.checkPartnership,
                    auth: {
                        strategy: 'jwt'
                    }
                }
            },
            {
                method: 'GET',
                path: '/partnership/referral/{userId}',
                options: {
                    description: 'Returns ref link',
                    handler: partnershipCtrl.getRefLink,
                    auth: {
                        strategy: 'jwt'
                    }
                }
            },
            {
                method: 'GET',
                path: '/partnership/accounts-referred/{userId}',
                options: {
                    description: 'Returns list of referred users',
                    handler: partnershipCtrl.getRefAccounts,
                    auth: {
                        strategy: 'jwt'
                    }
                }
            },
            {
                method: 'POST',
                path: '/partnership',
                options: {
                    description: 'set partnership of group',
                    handler: partnershipCtrl.setPartnership,
                    auth: {
                        strategy: 'jwt'
                    }
                }
            },
        ]);
    },
    version: require('../package.json').version,
    name: 'route-partnership'
};