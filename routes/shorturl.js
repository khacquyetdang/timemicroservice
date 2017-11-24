var express = require('express')
var router = express.Router()

var newShortUrlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/;

router.get(newShortUrlRegex, function (req, res, next) {
    var originalUrl = req.path.substring(1);
    var result = {
      "original_url": originalUrl,
      "short_url": "https://little-url.herokuapp.com/8170"
    };
    res.send(result);
});

module.exports = router