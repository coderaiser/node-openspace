# Openspace [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL]

Open files, web sites, executables via web sockets middleware.

## Install

```
npm i openspace --save
```

## Client

Could be loaded from url `/openspace/openspace.js`.

```js
const prefix = '/openspace';

/* could be one argument: callback */
openspace(prefix, function(opener) {
    const path = 'hello.js';
    const end  = () => {
        console.log('end');
        opener.removeListener('end', end);
    };
    
    opener.open(from, to, names);
    
    opener.on('end', end);
    opener.on('error', (error) => {
        console.error(error.message);
    });
});
```

## Server

```js
const openspace = require('openspace');
const http = require('http');
const express = require('express');
const io = require('socket.io');
const app = express();
const port = 1337;
const server = http.createServer(app);
const socket = io.listen(server);

server.listen(port);

app.use(openspace({
    online: true
});

openspace.listen(socket, {
    prefix: '/openspace',   /* default              */
    root: '/',              /* string or function   */
    authCheck: (socket, ok) => { /* optional        */
        /* auth check logic */
        ok();
    }
});
```

## License

MIT

[NPMIMGURL]:                https://img.shields.io/npm/v/openspace.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/david/coderaiser/node-openspace.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/node-openspace/master.svg?style=flat
[NPMURL]:                   https://npmjs.org/package/openspace "npm"
[DependencyStatusURL]:      https://david-dm.org/coderaiser/node-openspace "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"
[BuildStatusURL]:           https://travis-ci.org/coderaiser/node-openspace  "Build Status"

