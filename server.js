var express = require('express');
var app = express();
var http = require('http').Server(app);
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var fs = require('fs-extra');

// Connection URL
var url = 'mongodb://localhost:27017/myproject';
var database, clips;
var footage_root = __dirname +'/public/footage/';
var beginOff = new Date('2014 June 26 00:00:00').getTime();

// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log('connected correctly to db');
  database = db;
  clips = db.collection('clips');
});



app.use(express.static('public'));

app.get('/reset_db', function(req, res) {
  resetDb();
  res.json({success: true});
});

app.get('/get_clips', function(req, res) {
  var off = parseInt(req.query.off);
  var query = { startoff : { $lte: off }, endoff : { $gt : off }};
  clips.find(query).toArray(function(err, data) {
    res.json(data);
  });
});

http.listen(3000, function(){
  console.log('listening on port 3000');
});


function resetDb() {
  database.dropCollection('clips', function(err) {
    var folders = fs.readdirSync(footage_root);
    folders.forEach(function(folder) {
      console.log(folder);
      var path = footage_root + folder;
      if (fs.lstatSync(path).isDirectory()) {
        var files = fs.readdirSync(path);
        files.forEach(function(f) {
          if (f.indexOf('.mp4') !== -1 || f.indexOf('.mov') !== -1) {
            addClip(folder, f);
          }
        });
      }
    });
  });
}

function addClip(folder, file) {
  var toks = folder.split('_');
  var type = toks[0];
  var person = toks[1];
  var day = file.substring(0, file.indexOf('_')).replace(/-/g, ' ');
  var time = file.substring(day.length+1, file.indexOf('_+')).replace(/_/g, ':');
  var startoff = new Date(day+' '+time).getTime() - beginOff;
  var duration = parseInt(file.substring(file.indexOf('_+')+2, file.length-4))*1000;
  var endoff = startoff + duration;
  console.log(startoff, duration, endoff);
  var c = {
    path: '/footage/'+folder+'/'+file,
    type: type,
    person: person,
    startoff: startoff,
    endoff: endoff,
    duration: duration
  };
  clips.insertOne(c, function(err, res) {
    console.log('successfully entered '+folder+':'+file);
  });
}
