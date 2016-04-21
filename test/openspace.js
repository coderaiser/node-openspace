'use strict';

let http = require('http');
let express = require('express');
let test = require('tape');
let freeport = require('freeport');
let pipe = require('pipe-io');
let io = require('socket.io');
let ioClient = require('socket.io-client');
let openspace = require('..');

let connect = (fn) => {
    freeport((error, port) => {
        let app = express();
        let server = http.createServer(app);
        let ip = '127.0.0.1';
        
        app.use(openspace());
        openspace.listen(io(server));
        
        server.listen(port, ip, () => {
            let url = `http://127.0.0.1:${port}/openspace`;
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
