/*!
 * serve-upload
 * Copyright(c) 2015 George Chung
 * MIT Licensed
 */

'use strict'

var path = require('path')
var fs = require('fs')

var parseurl = require('parseurl')
var Busboy = require('busboy')

function serveUpload(root) {
  if (!root) {
    throw new TypeError('root path required')
  }

  var rootPath = path.normalize(path.resolve(root) + path.sep)
  var template = fs.readFileSync(path.join(__dirname, 'template.html'), { encoding: 'utf8' })
  var templateLength = template.length

  return function (req, res, next) {
    if (req.method != 'GET' && req.method != 'HEAD' && req.method != 'POST') {
      res.statusCode = 'OPTIONS' === req.method ? 204 : 405
      res.setHeader('Allow', 'OPTIONS, GET, HEAD, POST')
      res.end()
      return
    }

    var url = parseurl(req)
    var dir = decodeURIComponent(url.pathname)
    var fullPath = path.normalize(path.join(rootPath, dir))

    fs.stat(fullPath, function(err, stat){
      if (err) {
        switch (err.code) {
          case 'ENOENT':
            res.statusCode = 404
            break
          case 'ENAMETOOLONG':
            res.statusCode = 414
            break
          default:
            res.statusCode = 500
        }
        return next(err)
      }

      if (!stat.isDirectory()) return next()

      if (req.method == 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(template)
      } else if (req.method == 'POST') {
        var busboy = new Busboy({ headers: req.headers })
        busboy.on('file', function (fieldname, file, filename) {
          file.pipe(fs.createWriteStream(path.join(fullPath, filename)))
        })
        busboy.on('finish', function () {
          res.writeHead(302, { 'Location': req.path })
          res.end()
        })
        req.pipe(busboy)
      }
    })
  }
}

module.exports = serveUpload