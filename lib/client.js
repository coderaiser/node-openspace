var io, exec, Emitify, loadRemote;

(function(global) {
    'use strict';
    
    if (typeof module !== 'undefined' && module.exports)
        module.exports  = new OpenpaceProto();
    else
        global.openspace   = new OpenpaceProto();
    
    function OpenpaceProto() {
        function load(prefix, socketPath, callback) {
            if (!callback) {
                if (!socketPath) {
                    callback    = prefix;
                    prefix      = '/openspace';
                } else {
                    callback    = socketPath;
                    socketPath  = '';
                }
            }
            
            socketPath += '/socket.io';
            
            loadAll(prefix, function() {
                init();
                
                if (typeof callback === 'function')
                    callback(Openpace(prefix, socketPath));
            });
        }
        
        function Openpace(prefix, socketPath) {
            if (!(this instanceof Openpace))
                return new Openpace(prefix, socketPath);
            
            Emitify.call(this);
            this._progress = ProgressProto(prefix, socketPath, this);
        }
        
        function init() {
            Openpace.prototype = Object.create(Emitify.prototype);
            
            Openpace.prototype.open = function(path) {
                this._progress.open(path);
            };
        }
        
        function loadAll(prefix, callback) {
            var scripts = [];
            
            if (!exec)
                scripts.push('/modules/execon/lib/exec.js');
            
            if (!scripts.length)
                loadFiles(prefix, callback);
            else
                loadScript(scripts.map(function(name) {
                    return prefix + name;
                }), function() {
                    loadFiles(prefix, callback);
                }); 
        }
        
        function getModulePath(name, lib) {
            var path    = '',
                libdir  = '/',
                dir     = '/modules/';
                
            if (lib)
                libdir  = '/' + lib + '/';
            
            path    = dir + name + libdir + name + '.js';
            
            return path;
        }
        
        function loadFiles(prefix, callback) {
            exec.series([
                function(callback) {
                    var obj     = {
                            loadRemote  : getModulePath('loadremote', 'lib'),
                            load        : getModulePath('load'),
                            Emitify     : getModulePath('emitify', 'dist'),
                            join        : '/join/join.js'
                        },
                        
                        scripts = Object.keys(obj)
                            .filter(function(name) {
                                return !window[name];
                            })
                            .map(function(name) {
                                return prefix + obj[name];
                            });
                    
                    exec.if(!scripts.length, callback, function() {
                        loadScript(scripts, callback);
                    });
                },
                
                function(callback) {
                    loadRemote('socket', {
                        name : 'io',
                        prefix: prefix
                    }, callback);
                },
                
                function() {
                    callback();
                }
            ]);
        }
        
        function loadScript(srcs, callback) {
            var i       = srcs.length,
                func    = function() {
                    --i;
                    
                    if (!i)
                        callback();
                };
            
            srcs.forEach(function(src) {
                var element = document.createElement('script');
                
                element.src = src;
                element.addEventListener('load', function load() {
                    func();
                    element.removeEventListener('load', load);
                });
                
                document.body.appendChild(element);
            });
        }
        
        function ProgressProto(room, socketPath, openspace) {
            var socket,
                href            = getHost(),
                FIVE_SECONDS    = 5000;
            
            if (!(this instanceof ProgressProto))
                return new ProgressProto(room, socketPath, openspace);
            
            socket = io.connect(href + room, {
                'max reconnection attempts' : Math.pow(2, 32),
                'reconnection limit'        : FIVE_SECONDS,
                path                        : socketPath
            });
            
            socket.on('err', function(error) {
                openspace.emit('error', error);
            });
            
            socket.on('end', function() {
                openspace.emit('end');
            });
            
            socket.on('connect', function() {
                openspace.emit('connect');
            });
            
            socket.on('disconnect', function() {
                openspace.emit('disconnect');
            });
            
            function getHost() {
                var l       = location,
                    href    = l.origin || l.protocol + '//' + l.host;
                
                return href;
            }
        }
        
        return load;
    }
    
})(this);

