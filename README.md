# serve-upload

[![Greenkeeper badge](https://badges.greenkeeper.io/Gerhut/serve-upload.svg)](https://greenkeeper.io/)

Serve upload files in connect

## Install

    $ npm install --save serve-upload

## Usage

    var connect = require('connect')
    var serveUpload = require('serve-upload')

    var app = connect()
    app.use(serveUpload(process.cwd()))
    app.listen(3000)

## Test

    $ npm test

## License

MIT