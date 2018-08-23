'use strict'

var format = require('util').format
var needle = require('needle')
var cookie = require('cookie')
var fastfall = require('fastfall')()
var imageType = require('image-type')
var PassThrough = require('readable-stream').PassThrough

function PhotoLibrary (initial, session) {
  if (!(this instanceof PhotoLibrary)) {
    return new PhotoLibrary(initial, session)
  }

  this.initial = initial
  this.session = session
  this.cookies = session.cookies
}

// Downloads a photo by its corresponding index
PhotoLibrary.prototype.downloadByIndex = function (index, callback) {
  if (index < 1) {
    return callback(new Error('Invalid start index'), null)
  }

  var parsed = cookie.parse(this.cookies.join('; '))
  var validateToken = parsed['X-APPLE-WEBAUTH-VALIDATE']

  var url = format('%s/ph/download?syncToken=%s&validateToken=%s&locale=%s&clientId=%d', this.session.session.webservices.photos.url, this.initial.syncToken, validateToken, this.initial.locale, index)
  var options = {
    headers: {
      'Origin': 'https://www.icloud.com',
      'Cookie': this.cookies.join('; ')
    }
  }

  needle.get(url, options, function (err, res) {
    if (err) {
      return done(err, null)
    }

    var filename = res.headers['content-disposition'].match(/filename="([\S]+)"/)[1]

    if (!filename) {
      console.warn('Unable to identify filename')
    }

    var contents = res.body

    if (!Buffer.isBuffer(contents)) {
      return callback(new Error('Invalid content type'), null)
    }
    
    var stream = new PassThrough()
    stream.end(contents)

    return callback(null, { filename: filename || '?', stream: stream })
  })
}

// Upload photo remotely
PhotoLibrary.prototype.upload = function (file, callback) {
  file = file || {}
  
  if (!file.buffer) {
    return callback(new Error('File must have a buffer'), null)
  } 

  if (!this.initial.isUploadEnabled) {
    return callback(new Error('Upload functionality not enabled'), null)
  }

  if (!Buffer.isBuffer(file.buffer)) {
    return callback(new Error('Not a valid buffer'), null)
  }

  var mime = imageType(file.buffer)
  
  if(mime.mime) {
    mime = mime.mime.trim()
  }
  
  if (!mime.indexOf('image/jpeg') > -1 || !mime.indexOf('image/jpg') > -1) {
    return callback(new Error('Upload supports JPEG type only'), null) 
  }

  var url = format('%s/ph/upload?syncToken=%s&locale=%s', this.session.session.webservices.photos.url, this.initial.syncToken, this.initial.locale)
  var options = {
    headers: {
      'Origin': 'https://www.icloud.com',
      'Cookie': this.cookies.join('; ')
    },
    multipart: true,
    json: true
  }
  var data = {
    file: {
      buffer: file.buffer,
      filename: file.name || 'image.jpg',
      content_type: mime
    }
  }
  needle.post(url, data, options, function (err, res) {
    return err ? callback(err, null) : callback(null, res.body)
  })
}

// Get all folders
PhotoLibrary.prototype.folders = function (callback) {
  var url = format('%s/ph/folders?syncToken=%s&locale=%s&', this.session.session.webservices.photos.url, this.initial.syncToken, this.initial.locale)
  var options = {
    headers: {
      'Origin': 'https://www.icloud.com',
      'Cookie': this.cookies.join('; ')
    },
    json: true
  }

  needle.get(url, options, function (err, res) {
    if (err) {
      return callback(err, null)
    }

    var folders = res.body.folders

    return callback(null, folders.filter(function (folder) {
      return folder.contentsType === 'asset'
    }))
  })
}

PhotoLibrary.DEFAULT_LOCALE = 'en-us'

module.exports = PhotoLibrary

/* TODO: Album covers
var form = JSON.stringify({
syncToken: initial.syncToken,
methodOverride: 'GET',
clientIds: [ 220, 48, 307, 353 ]
})

http.post({
uri: util.format('%s/ph/assets?locale=%s&',
session.session.webservices.photos.url, DEFAULT_LOCALE),
form: form,
headers: {
'User-Agent': http.userAgent(),
'Origin': http.origin(),
'Cookie': cookies.join(';'),
'Content-Type': http.mime('json'),
'Content-Length': form.length
}
}, function(err, data) {
console.log(data)
});*/
/*
// TODO: Delete photo
function(json, cookies, callback) {
var form = JSON.stringify({
syncToken: initial.syncToken,
methodOverride: 'DELETE',
assets: [ { clientId: 687 } ]
})

http.post({
uri: util.format('%s/ph/assets?locale=%s&',
session.session.webservices.photos.url, DEFAULT_LOCALE),
form: form,
headers: {
'User-Agent': http.userAgent(),
'Origin': http.origin(),
'Cookie': cookies.join(';'),
'Content-Type': http.mime('json'),
'Content-Length': form.length
}
}, function(err, data) {
console.log(data)
})
} */
