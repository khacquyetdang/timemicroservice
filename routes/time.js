var express = require('express');
const dateFormat = require('dateFormat');
var router = express.Router()


function isNumeric(num) {
  return !isNaN(num)
}

router.get('/:time', function (req, res, next) {
  var time = req.params.time;
  var result = {
    "unix": null,
    "natural": null
  };
  var date = null;
  try {
    if (isNumeric(time)) {
      console.log("Is numeric");
      date = new Date(parseInt(time * 1000));
    }
    else {
      console.log("Not Is numeric: ", time);
      date = new Date(time);
    }
    result = {
      "unix": Math.floor(date.getTime() / 1000),
      "natural": dateFormat(date, 'mmmm dd, yyyy')
    };
  }
  catch (e) {
    console.log("erreur date format time", time, " erreur : ", e);
  }
  res.send(result);
});

module.exports = router