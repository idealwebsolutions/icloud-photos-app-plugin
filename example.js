'use strict'

var fs = require('fs')
var login = require('icloud-login-module')
var photos = require('./index')

var credentials = {
  username: 'YOUR_ICLOUD_USERNAME',
  password: 'YOUR_ICLOUD_PASSWORD'
}

// Login
login(credentials.username, credentials.password, {},
  function (err, session) {
    console.log(require('util').inspect(session.session, { depth: 4}))
    if (!err && session) {
      // Initialize the module
      // See below for sample output
      photos.init(session, {}, function (err, library) {
        // Catch any errors on initialization
        if (err) {
          return console.error(err)
        }

        // Get available folders (for future use)
        library.folders(function (err, folders) {
          if (err) {
            return console.error(err)
          }
          console.log(folders)
        })
        
        // Download a range of photos
        library.downloadByIndex(1, function (err, photo) {
          if (err) {
            return console.error(err)
          }
          photo.stream.pipe(fs.createWriteStream(photo.filename))
        })
        
        // Upload various photos (currently JPEG format supported only)
        var selected = fs.readFileSync('deer.jpeg')

        library.upload(selected, function (err, result) {
          if (err) {
            return callback(err, null)
          }
          console.log(result)
        })
      })
    } else {
      console.error(err)
    }
  }
)
