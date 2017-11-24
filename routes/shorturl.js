var express = require('express');
var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var router = express.Router();


//console.log("mongo db url ", mongodb_url);
var mongodb_url = process.env.mongodb_url;
router.get('/:linkId([0-9a-zA-Z]{1,100})', function (req, res, next) {
  var shortlinkId = parseInt(req.params.linkId);


  mongodb.connect(mongodb_url, function (err, db) {
    // db gives access to the database
    if (err !== null) {
      res.send({ "error": "Error connection to database" });
      return 1;
    }


    var collection = db.collection('short_url');

    collection.find({ "linkid" : shortlinkId }
    ).toArray(function (err, documents) {
      if (err) {
        res.send({ "error": "Error database" });
        console.log('error query ', err);
      }
      console.log("link documents", documents);
      if (documents.length >= 1) {
        var redirectUrl = documents[0].original_url;
        res.redirect(redirectUrl);
      }
      else {
        res.send({ "error": "Link not found" });
      }
    });
    db.close();
  });
});

router.get(/new\/.*/, function (req, res, next) {
  var newShortUrlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/;
  //var mongodb_url = process.env.mongodb_url;
  var originalUrl = req.path.substring(5);
  var hostUrl = req.protocol + "://" + req.headers.host;
  var result;
  if (newShortUrlRegex.test(originalUrl)) {
    result = {
      "original_url": originalUrl,
      "short_url": "https://little-url.herokuapp.com/8170"
    };

    mongodb.connect(mongodb_url, function (err, db) {
      // db gives access to the database
      if (err !== null) {
        console.log("Err connection to database ", err);
        res.send({ "error": "Error connection to database" });
        return 1;
      }

      function getNextSequence(name) {
        var ret = db.collection('counters').findOneAndUpdate(
          { _id: name },
          { $inc: { seq: 1 } },
          { upsert: true }
        );

        return ret;
      }

      var collection = db.collection('short_url');

      getNextSequence('userid').then(function (resOperation) {

        if (resOperation.ok === 1) {
          var linkId = resOperation.value.seq;
          var dataToInsert = {
            linkid : linkId,
            original_url : originalUrl
          };
  
          collection.insert(dataToInsert, function (err, data) {
            if (err) {
              res.send({ "error": "Error insertion to database" });
              console.log('error query ', err);
              db.close();              
            }
            res.send(
              { 
                original_url: originalUrl, 
                short_url: hostUrl + req.baseUrl + "/" + linkId 
              }
            );
            db.close();            
          });
        }
        else {
          result = {
            "error": "Error on database operation"
          };
          res.send(result);
          db.close();
          
        }
      });
    });
  }
  else {
    result = {
      "error": "Wrong url format, make sure you have a valid protocol and real site."
    };
    res.send(result);
    
  }
});

module.exports = router