require('should')

var fs = require('fs')
var os = require('os')
var path = require('path')

var async = require('async')
var connect = require('connect')
var request = require('request')

var serveUpload = require('./')

describe('serve-upload', function () {
  var PORT = 11111
  var TEMP_FILENAME = 'serveUpload.test'
  var root, server, template, tempFile

  before(function (done) {
    root = os.tmpdir()
    tempFile = path.join(root, TEMP_FILENAME)

    async.parallel([
      function (callback) {
        var app = connect()
        app.use(serveUpload(root))
        server = app.listen(PORT, callback)
      },
      function (callback) {
        var templateFile = path.join(__dirname, 'template.html')
        fs.readFile(templateFile, { encoding: 'utf8' }, function (err, data) {
          if (err)
            return callback(err)

          template = data
          callback()
        })
      }
    ], done)
  })

  after(function (done) {
    async.parallel([
      function (callback) {
        server.close(callback)
      },
      function (callback) {
        fs.unlink(tempFile, done)
      }
    ], done)
  })

  it('should response an upload form to a get request', function (done) {
    request({ uri: {
      protocol: 'http:',
      hostname: '127.0.0.1',
      port: PORT
    } }, function (error, response, body) {
      if (error)
        return done(error)

      body.should.equal(template)
      done()
    })
  })

  it('should upload the file to a post request', function (done) {
    request({
      uri: {
        protocol: 'http:',
        hostname: '127.0.0.1',
        port: PORT
      },
      method: 'POST',
      formData: {
        'file': {
          value: template,
          options: {
            filename: TEMP_FILENAME
          }
        }
      }
    }, function (error) {
      if (error)
        return done(error)

      fs.readFile(tempFile, { encoding: 'utf8' }, function (err, data) {
        if (err)
          return done(err)

        data.should.equal(template)
        done()
      })
    })
  })
})