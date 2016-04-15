
var app = require('express')();
var http = require('http').Server(app);

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var fs = require('fs-extra');

// Connection URL
var url = 'mongodb://localhost:27017/myproject';
var clips;

var footage_root = __dirname +'/footage/';
var mp4 = require('mp4js');
var mp4duration = require("mp4duration");


// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log('connected correctly to db');
  clips = db.collection('clips');
});



app.get('/', function(req, res){
  res.sendfile('public/index.html');
});

app.get('/reset_db', function(req, res) {
  resetDb();
  res.json({success: true});
});

http.listen(3000, function(){
  console.log('listening on port 3000');
});


function resetDb() {
  fs.readdir(footage_root, function(err0, folders) {
    folders.forEach(function(folder) {
      var path = footage_root + folder;
      if (fs.lstatSync(path).isDirectory()) {
        var toks = folder.split('_');
        var type = toks[0];
        var person = toks[1];

        fs.readdir(path, function(err1, files) {
          files.forEach(function(f) {
            if (f.indexOf('.mp4') !== -1) { // || f.indexOf('.mov') !== -1) {
              mp4duration.parse(path+'/'+f, function(err, tags) {
                if (err) console.log(err)
                console.log(tags);
              });
            }
          });
        });
      }
    });
  });
}
