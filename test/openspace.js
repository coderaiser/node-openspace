'use strict';

let http = require('http');
let path = require('path');
let express = require('express');
let test = require('tape');
let freeport = require('freeport');
let io = require('socket.io');
let ioClient = require('socket.io-client');
let openspace = require('..');

let connect = (path, options, fn) => {
    if (!path) {
        throw Error('path could not be empty!');
    } else if (!fn && !options) {
        fn = path;
        path = '';
    } else if (!fn) {
        fn = options;
        options = null;
    }
    
    path = path.replace(/^\/|\/$/g, '');
    
    if (!options || !options.prefix) {
        path = 'openspace';
    } else {
        let prefix = options.prefix || 'openspace';
        path = `${prefix}${!path ? '' : '/' + path}`;
    }
    
    let app = express();
    let server = http.createServer(app);
    
    app.use(openspace(options));
    openspace.listen(io(server), options);
        
    freeport((error, port) => {
        let ip = '127.0.0.1';
        
        if (options && !Object.keys(options).length)
            options = undefined;
        
        server.listen(port, ip, () => {
            let url = `http://127.0.0.1:${port}/${path}`;
            let socket = ioClient(url);
            
            fn(socket, () => {
                socket.destroy();
                server.close();
            });
        });
    });
};

test('openspace: open file that doesn\'t exist', (t) => {
    connect((socket, callback) => {
        socket.on('connect', () => {
            socket.emit('open', 'hello world');
            socket.on('err', (error) => {
                t.ok(/^Exited with code/.test(error), 'should be open error');
                t.end();
                callback();
            });
        });
    });
});

test('openspace: open file that exist', (t) => {
    connect((socket, callback) => {
        socket.on('connect', () => {
            socket.emit('open', __filename);
            
            socket.on('end', () => {
                t.pass('file opened');
                t.end();
                callback();
            });
            
            socket.on('err', (error) => {
                t.equal(error.message, 'Exited with code 3', 'A required tool could not be found');
                t.end();
                callback();
            });
        });
    });
});

test('openspace: options: prefix', (t) => {
    connect('/', {prefix: 'hello'}, (socket, callback) => {
        socket.on('connect', () => {
            socket.emit('open', __filename);
            
            socket.on('end', () => {
                t.pass('file opened');
                t.end();
                callback();
            });
        });
    });
});

test('openspace: options: root', (t) => {
    connect('/', {root: __dirname}, (socket, callback) => {
        socket.on('connect', () => {
            socket.emit('open', path.basename(__filename));
            
            socket.on('end', () => {
                t.pass('file opened');
                t.end();
                callback();
            });
        });
    });
});

test('openspace: options: empty object', (t) => {
    connect('/', {}, (socket, callback) => {
        socket.on('connect', () => {
            socket.emit('open', __filename);
            socket.on('end', () => {
                t.pass('file opened');
                t.end();
                callback();
            });
        });
    });
});

test('openspace: options: authCheck not function', (t) => {
    let authCheck = {};
    let fn = () => {
        connect('/', {authCheck}, () => {
        });
    };
    
    t.throws(fn, /authCheck should be function!/, 'should throw when authCheck not function');
    t.end();
});

test('openspace: options: authCheck: wrong credentials', (t) => {
    let authCheck = (socket, fn) => {
        socket.on('auth', (username, password) => {
            if (username === 'hello' && password === 'world')
                fn();
            else
                socket.emit('err', 'Wrong credentials');
        });
    };
    
    connect('/', {authCheck}, (socket, fn) => {
        socket.emit('auth', 'jhon', 'lajoie');
        
        socket.on('err', (error) => {
            t.equal(error, 'Wrong credentials', 'should return error');
            t.end();
            fn();
        });
    });
});

test('openspace: options: authCheck: correct credentials', (t) => {
    let authCheck = (socket, fn) => {
        socket.on('auth', (username, password) => {
            if (username === 'hello' && password === 'world')
                fn();
            else
                socket.emit('err', 'Wrong credentials');
        });
    };
    
    connect('/', {authCheck}, (socket, fn) => {
        socket.emit('auth', 'hello', 'world');
        
        socket.on('connect', () => {
            t.pass('should grant access');
            t.end();
            fn();
        });
        
        socket.on('err', (error) => {
            t.notOk(error, 'should not be error');
        });
    });
});

