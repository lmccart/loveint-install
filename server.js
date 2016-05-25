var express = require('express');
var app = express();
var http = require('http').Server(app);
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var fs = require('fs-extra');

// Connection URL
var url = 'mongodb://localhost:27017/loveint';
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

app.get('/get_sorted', function(req, res) {
  clips.find({}).toArray(function(err, data) {
    data.sort(function (a, b) {
      return a.startoff < b.startoff ? -1 : +1;
    })
    res.json(data);
  });
});

app.get('/get_stats', function(req, res) {
  var last = 0;
  clips.find({}).toArray(function(err, data) {
    data.forEach(function (item) {
      last = Math.max(last, item.endoff);
    });
    res.json({total_time: last});
  });
});

app.get('/get_timing', function(req, res) {
  clips.find({}).toArray(function(err, data) {
    data.sort(function (a, b) {
      return a.startoff < b.startoff ? -1 : +1;
    })
    data = data.filter(function (item) {
      return item.type == 'watching';
    })
    data = data.map(function (item) {
      return {
        person: item.person,
        startoff: item.startoff,
        endoff: item.endoff
      }
    })
    res.json(data);
  });
})

http.listen(3002, function(){
  console.log('listening on port 3002');
});

function resetDb() {
  console.log('reseting db based on '+footage_root);
  database.dropCollection('clips', function(err) {
    var folders = fs.readdirSync(footage_root);
    var data = buildClips(folders);
    data = removeSoloClips(data);
    data = collapseEmptySpace(data);
    console.log(data.length);
    data.map(addClip);
  });
}

function buildClips(folders) {
  var data = [];
  folders.forEach(function(folder) {
    console.log(folder);
    var path = footage_root + folder;
    if (fs.lstatSync(path).isDirectory()) {
      var files = fs.readdirSync(path);
      files.forEach(function(f) {
        if (f.indexOf('.mp4') !== -1 || f.indexOf('.mov') !== -1) {
          data.push(buildClip(folder, f));
        }
      });
    }
  });
  return data;
}

function buildClip(folder, file) {
  var toks = folder.split('_');
  var type = toks[0];
  var person = toks[1];
  var day = file.substring(0, file.indexOf('_')).replace(/-/g, ' ');
  var time = file.substring(day.length+1, file.indexOf('_+')).replace(/_/g, ':');
  var startoff = new Date(day+' '+time).getTime() - beginOff;
  var duration = parseInt(file.substring(file.indexOf('_+')+2, file.length-4))*1000;
  duration = Math.max(1000, duration - 1000); // cut off the last second if possible
  var endoff = startoff + duration;
  // console.log(startoff, duration, endoff);
  return {
    path: '/footage/'+folder+'/'+file,
    type: type,
    person: person,
    startoff: startoff,
    endoff: endoff,
    duration: duration
  };
}

function removeSoloClips(data) {
  return data.filter(function (a) {
    return data.some(function (b) {
      return a.startoff == b.startoff && a.path != b.path;
    });
  })
}

function collapseEmptySpace(data, inbetweenTime) {
  inbetweenTime = inbetweenTime || 10 * 1000; // 10 seconds
  var previousEndoff = 0;
  var timeOffset = 0;
  data.sort(function (a, b) {
      return a.startoff < b.startoff ? -1 : +1;
  })
  data.forEach(function (item) {
    // if the current start time
    // happens after the previousEndoff
    if (item.startoff > previousEndoff) {
      // then we need to collapse that time
      timeOffset -= (item.startoff - previousEndoff);
      // if this isn't the first item
      if(previousEndoff > 0) {
        // add a little buffer
        timeOffset += inbetweenTime;
      }
    }
    // keep track of the most recent endoff
    // (do this before modifying the endoff)
    previousEndoff = item.endoff;
    // and apply the offset now and for all future items
    item.startoff += timeOffset;
    item.endoff += timeOffset;
  })
  return data;
}

function addClip(clip) {
  clips.insertOne(clip, function(err, res) {
    console.log('successfully entered ' + clip.path);
  });  
}
