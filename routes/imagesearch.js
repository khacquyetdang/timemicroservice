var express = require('express');
var request = require('request');
var mongodb = require('mongodb');
var moment = require('moment-timezone');
var ObjectId = require('mongodb').ObjectID;
var router = express.Router();


//console.log("mongo db url ", mongodb_url);
var mongodb_url = process.env.mongodb_url;
router.get('/latest', function (req, res, next) {
  mongodb.connect(mongodb_url, function (err, db) {
    // db gives access to the database
    if (err !== null) {
      console.log("Err connection to database ", err);
      res.send({ "error": "Error connection to database" });
      return 1;
    }
    var collection = db.collection('imagesearch');

    collection.find({}, { _id: 0, term: 1, when: 1 }).limit(20).sort({ when: -1 }).toArray(function (err, documents) {
      if (err) {
        res.send({ "error": "Error query database" });
        console.log('error query ', err);
        return;
      }
      console.log("link documents", documents);
      var latestItemsSearched = [];
      documents.forEach(element => {
        //var dateSearchTZ = moment.tz(new Date(element.when).toUTCString(), "Europe/Paris");
        var dateSearchTZ = new Date(element.when).toISOString();
        
        latestItemsSearched.push({
          term: element.term,
          when: dateSearchTZ
        });
      });
      res.send(latestItemsSearched);
    });
    db.close();
  });
});

router.get('/:query', function (req, res, next) {
  var query = req.
    params.query;
  var offset = 1;
  if (req.query.offset !== undefined) {
    offset = req.query.offset;
  }

  mongodb.connect(mongodb_url, function (err, db) {
    // db gives access to the database
    if (err !== null) {
      console.log("Err connection to database ", err);
      res.send({ "error": "Error connection to database" });
      return 1;
    }

    var collection = db.collection('imagesearch');

    
    var dataToInsert = {
      term: query,
      //when: new Date().toU()
      when: Date.now()      
    };

    collection.insert(dataToInsert, function (err, data) {
      if (err) {
        res.send({ "error": "Error insertion to database" });
        console.log('error query ', err);
      }
      db.close();
    });
  });

  var searchUrl = "https://www.googleapis.com/customsearch/v1?key=" + process.env.google_search_api + "&searchType=image&q="
    + query + "&cx="
    + process.env.google_search_ctx
    + "&start=" + offset;
  request(searchUrl, function (error, response, body) {
    if (error !== null) {
      res.send({ "error": error });
      return;
    }
    try {
      var bodyJson = JSON.parse(body);
      if (bodyJson.error) {
        res.send(bodyJson.error);
      }
      else {
        var items = [];
        bodyJson.items.forEach(element => {
          console.log(element);
          var item = {
            url: element.link,
            snippet: element.snippet,
            thumbnail: element.image.thumbnailLink,
            context: element.image.contextLink
          };
          items.push(item);
        });
        res.send(items);
      }
    } catch (exception) {
      res.send({ "error": exception });
      return;
    }
  });
});

module.exports = router