'use strict';

var open    = require('open'),
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
    
    path = mellow.pathToWin(from, value);
    
    operate(socket);
}

function operate(socket, path) {
    var opener = open(path);
    
    opener.on('error', function(error, name) {
        socket.emit('err', error.message);
    });
    
    opener.on('end', function() {
        socket.emit('end');
    });
}

})();

