# icloud-photos-app-plugin
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

_NO LONGER MAINTAINED / ARCHIVED ONLY FOR HISTORICAL PURPOSES_

Manage photos on iCloud

## Install
Since this is not yet available on npm, you can install the module by following
these steps:

1. Clone this repository

        $ git clone https://github.com/idealwebsolutions/icloud-photos-app-plugin.git

2. Clone the `icloud-login-module` repository

        $ git clone https://github.com/idealwebsolutions/icloud-login-module.git

## API
### .init(session, options, callback)
This function will initialize the module by using the given `session`. `options`
include a `locale` option, which specifies which locale to use - if none is
given, it defaults to `en-us`. `callback` returns the photo library if successful.

## Photo Library API
### .download(start, end, callback)
This function will attempt to download a range of photos from a given `start`
and `end` index. This will require the end user to know how many photos exist.
Since this module is quite early and immature, there will likely be a change
in future releases to make this easier. `callback` will contain an array of image
filenames and buffers. See above for an example.

### .upload(files, callback)
This function will upload various image assets from the local directory to
the remote Photo Library. Two paramaters are passed in; `files` an array of
file paths to read from, and `callback` returning success/failure results.
At the moment, no other formats other than `JPEG` are accepted by Apple. See
above for an example.

### .folders(callback)
This function returns an array of folders containing assets. While it has no
real use yet, it will be used to get contents of folders
(ex: `folders.get('videos')`). The only parameter needed is a `callback`. See
above for an example.

## TODO
- Videos
- View photo details (ex: dimensions, tags, favorites)
- Delete photo(s) functionality
- Download 'all' functionality
- Manage by albums
- Tests

## Bugs/Errors
As always feel free to submit any bugs or errors that you come across. Pull
requests are welcomed.

## License
MIT
