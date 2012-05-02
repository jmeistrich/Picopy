About
=====
Picopy is a tool for copying photos between web services. It runs entirely in client-side javascript and is designed to make it easy to plug in new services. It currently supports copying from Google+/Picasa to Facebook.

Features
=====
- Preserves album names, album order, and image order within the album
- Preserves original captions
- Adds link to the original Google+/Picasa photo on Facebook
- Intuitive progress indicator shows each image move over as it gets copied
- Allows copying of all Google+/Picasa photos including private albums (does not yet propagate privacy settings)

Files
=====
- [GoogleSync.js](https://github.com/jmeistrich/Picopy/blob/master/googleSync.js): Google login, enumerate Google+/Picasa albums and photos
- [FacebookSync.js](https://github.com/jmeistrich/Picopy/blob/master/facebookSync.js): Facebook login, enumerate Facebook albums and photos, create album, add photos
- [Picopy.js](https://github.com/jmeistrich/Picopy/blob/master/picopy.js): The main javascript code - mostly UI related.
- [Live.js](https://github.com/jmeistrich/Picopy/blob/master/live.js): A modified version of [Live.js](http://livejs.com) which supports reloading javascript
- [Debug.js](https://github.com/jmeistrich/Picopy/blob/master/debug.js): A helper to map hotkeys to functions