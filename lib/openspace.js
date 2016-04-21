'use strict';

var open    = require('opn'),
    mellow  = require('mellow');

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
    var prefix  = options.prefix || 'openspace',
        root    = options.root   || '/';
    
    socket.of(prefix)
        .on('connection', function(socket) {
            socket.on('open', function(from, to, files) {
                preprocess('open', root, socket, from, to, files);
            });
        })
        .on('error', function(error) {
            console.error(error);
        });
}

function preprocess(op, root, socket, path) {
    var value   = getRoot(root);
    
    path = mellow.pathToWin(path, value);
    
    operate(socket, path);
}

function operate(socket, path) {
    open(path).then((opener) => {
        socket.emit('end');
    }).catch(function(error) {
        socket.emit('err', error.message);
    });
}

