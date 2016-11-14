'use strict';

const path = require('path');

const test = require('tape');
const openspace = require('..');
const connect = require('./connect')('openspace', openspace);

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
    connect((socket, end) => {
        socket.on('connect', () => {
            socket.emit('open', __filename);
            
            socket.on('end', () => {
                t.pass('file opened');
                t.end();
                end();
            });
            
            socket.on('err', (error) => {
                t.ok(/^Exited with code 3/.test(error), 'should be open error');
                t.end();
                end();
            });
        });
    });
});

test('openspace: options: prefix', (t) => {
    const prefix = 'hello';
    connect('/', {prefix}, (socket, end) => {
        socket.on('connect', () => {
            t.pass('connected with prefix');
            t.end();
            end();
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
    const authCheck = {};
    const fn = () => {
        connect('/', {authCheck}, () => {
        });
    };
    
    t.throws(fn, /authCheck should be function!/, 'should throw when authCheck not function');
    t.end();
});

test('openspace: options: authCheck: wrong credentials', (t) => {
    const authCheck = (socket, fn) => {
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
    const authCheck = (socket, fn) => {
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

