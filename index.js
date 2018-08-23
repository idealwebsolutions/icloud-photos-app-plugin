'use strict'

var format = require('util').format
var randomUA = require('random-ua')
var needle = require('needle')

var PhotoLibrary = require('./lib/photo')

function flatten(cookies) {
  return Object.keys(cookies).map(function (cookie) {
    return cookie + '=' + cookies[cookie]
  })
}

exports.init = function (login, options, callback) {
  options = options || {}

  needle.defaults({
    user_agent: randomUA.generate()
  })

  var locale = options.locale || PhotoLibrary.DEFAULT_LOCALE

  if (login.session && !('photos' in login.session.webservices)) {
    return callback(new Error('Photos web service does not exist'), null)
  }

  var url = format('%s/ph/startup?locale=%s', login.session.webservices.photos.url, locale)
  var options = {
    headers: {
      'Origin': 'https://www.icloud.com',
      'Cookie': flatten(login.cookies).join('; ')
    },
    json: true
  }

  needle.get(url, options, function (err, res) {
    if (err) {
      return callback(err, null)
    }

    var initial = res.body
    var cookies = res.cookies

    if (!res.cookies['X-APPLE-WEBAUTH-TOKEN']) {
      return callback(new Error('WebAuth token was not found'), null)
    }

    login.cookies['X-APPLE-WEBAUTH-TOKEN'] = res.cookies['X-APPLE-WEBAUTH-TOKEN']
    login.cookies = flatten(login.cookies)
    initial.locale = locale

    callback(null, PhotoLibrary(initial, login))
  })
}
