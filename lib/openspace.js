'use strict';

const open = require('opn');
const mellow = require('mellow');

module.exports = (socket, options) => {
    if (!options)
        options = {};
    
    listen(socket, options);
};

function getRoot(root) {
    if (typeof root === 'function')
        return root();
    
    return root;
}

function listen(socket, options) {
    const authCheck = options.authCheck;
    const prefix = options.prefix || 'openspace';
    const root = options.root   || '/';
    
    if (authCheck && typeof authCheck !== 'function')
        throw Error('authCheck should be function!');
    
    socket.of(prefix)
        .on('connection', (socket) => {
            if (!authCheck)
                return connection(root, socket);
            
            authCheck(socket, () => {
                connection(root, socket);
            });
        });
}

function connection(root, socket) {
    socket.on('open', (path) => {
        preprocess('open', root, socket, path);
    });
}

function preprocess(op, root, socket, path) {
    const value = getRoot(root);
    
    path = mellow.pathToWin(path, value);
    
    operate(socket, path);
}

function operate(socket, path) {
    open(path).then(() => {
        socket.emit('end');
    }).catch((error) => {
        socket.emit('err', error.message);
    });
}

