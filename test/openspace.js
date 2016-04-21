'use strict';

let http = require('http');
let path = require('path');
let express = require('express');
let test = require('tape');
let freeport = require('freeport');
let pipe = require('pipe-io');
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
    freeport((error, port) => {
        let app = express();
        let server = http.createServer(app);
        let ip = '127.0.0.1';
        
        if (options && !Object.keys(options).length)
            options = undefined;
        
        app.use(openspace(options));
        openspace.listen(io(server), options);
        
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
        })
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
        })
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
        })
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
        })
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
        })
    });
});

