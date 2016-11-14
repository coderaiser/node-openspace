'use strict';

var open = require('opn');
var mellow = require('mellow');

module.exports = function(socket, options) {
    if (!options)
        options = {};
    
    listen(socket, options);
};

function getRoot(root) {
    var value;
    
    if (typeof root === 'function')
        value = root();
    else
        value = root;
    
    return value;
}

function listen(socket, options) {
    var authCheck   = options.authCheck,
        prefix      = options.prefix || 'openspace',
        root        = options.root   || '/';
    
    if (authCheck && typeof authCheck !== 'function')
        throw Error('authCheck should be function!');
    
    socket.of(prefix)
        .on('connection', function(socket) {
            if (!authCheck)
                connection(root, socket);
            else
                authCheck(socket, function() {
                    connection(root, socket);
                });
        });
}

function connection(root, socket) {
    socket.on('open', function(path) {
        preprocess('open', root, socket, path);
    });
}

function preprocess(op, root, socket, path) {
    var value   = getRoot(root);
    
    path = mellow.pathToWin(path, value);
    
    operate(socket, path);
}

function operate(socket, path) {
    open(path).then(function() {
        socket.emit('end');
    }).catch(function(error) {
        socket.emit('err', error.message);
    });
}

