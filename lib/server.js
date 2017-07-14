'use strict';

const DIR_ROOT = __dirname + '/..';
const path = require('path');
const join = require('join-io');
const openspace = require('./openspace');

module.exports = (options) => {
    return serve.bind(null, options);
};

module.exports.listen = (socket, options) => {
    openspace(socket, options || {});
};

function checkOption(isOption) {
    const type = typeof isOption;
    
    switch(type) {
    case 'function':
        return isOption();
    
    case 'undefined':
        return true;
    
    default:
        return isOption;
    }
}

function serve(options, req, res, next) {
    var joinFunc, isJoin, isConfig,
        
        o           = options || {},
        
        isOnline    = checkOption(o.online),
        
        url         = req.url,
        prefix      = o.prefix || '/openspace',
        
        is          = !url.indexOf(prefix),
        
        URL         = 'openspace.js',
        CONFIG      = '/options.json',
        MODULES     = '/modules.json',
        
        PATH        = '/lib/client.js',
        sendFile    = () => {
            url = path.normalize(DIR_ROOT + url);
            res.sendFile(url);
        };
    
    if (!is) {
        next();
    } else {
        url         = url.replace(prefix, '');
        
        isJoin      = !url.indexOf('/join');
        isConfig    = url === CONFIG;
        
        switch(url) {
        case URL:
            url = PATH;
            break;
        
        case MODULES:
            url = '/json' + url;
            break;
        }
        
        req.url = url;
        
        if (isConfig) {
            res .type('json')
                .send({
                    online: isOnline
                });
        } else if (!isJoin) {
            sendFile();
        } else {
            joinFunc = join({
                dir: DIR_ROOT,
            });
            
            joinFunc(req, res, next);
        }
    }
}

