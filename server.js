var _ = require('underscore');
var sh = require('sh');
var spotify = require('spotify');
var express = require('express');
var bodyParser = require('body-parser');

// Configuration
var port = process.env.PORT || 3344;
var secret = process.env.SHARED_SECRET || "sekret";

// Runtime options
var options = {
  muted: false,
  volume: 100
};

var app = express();

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

function currentTrack(callback) {
  var song = sh('osascript src/scripts/current_song.scpt');
  song.result(function(track) {
    callback(track);
  });
}

app.get('/', function (req, res) {
  sh('osascript -e \'tell app "Spotify" to play track "spotify:artist:4Z8W4fKeB5YxbusRsdQVPb"\'');
  res.send('Hello World!');
});

app.post('/toggle', function (req, res) {
  sh('osascript -e \'tell app "Spotify" to playpause\'');
  res.send('OK');
});

app.post('/play', function (req, res) {
  sh('osascript -e \'tell app "Spotify" to playpause\'');
  res.send('OK');
});

app.post('/pause', function (req, res) {
  sh('osascript -e \'tell app "Spotify" to playpause\'');
  res.send('OK');
});

app.post('/next', function (req, res) {
  sh('osascript -e \'tell app "Spotify" to next track\'');

  currentTrack(function(track) {
    res.send(track);
  });
});

app.post('/prev', function (req, res) {
  sh('osascript -e \'tell app "Spotify" to previous track\'');

  currentTrack(function(track) {
    res.send(track);
  });
});

app.post('/playing', function (req, res) {
  currentTrack(function(track) {
    res.send(track);
  });
});

// app.post('/volume', function (req, res) {
  // var up = req.params.direction === "up";

  // if (up) {
  //   if (options.volume < 100) {
  //     options.volume += 10;
  //   }
  //   res.send("Louder!");
  // }
  // else {
  //   if (options.volume > 0) {
  //     options.volume -= 10;
  //   }
  //   res.send("Quiet now");
  // }


  // options.volume = Math.round(volume)*10 if volume <= 100

  // sh('osascript -e \'tell application "Spotify" to set sound volume to '+options.volume+'\'')
// });

app.post('/mute', function (req, res) {
  var response_text = "muted";

  if (options.muted) {
    sh('osascript -e \'tell application "Spotify" to set sound volume to '+options.volume+'\'');
    response_text = "unmuted";
  }
  else {
    sh('osascript -e \'tell application "Spotify" to set sound volume to 0\'');
  }

  options.muted = !options.muted;

  res.send(response_text);
});

app.post('/search', function (req, res) {
  var type = req.body.type,
      query = req.body.query,
      result;

  console.log("Search for "+ type +": "+ query);

  spotify.search({
    type: type,
    query: query,
    limit: 20
  }, function(err, data) {
    if (err) {
      console.log("Spotify errored", err);
      return res.send("whoops", 400);
    }

    switch(type) {
      case "track":
        var tracks = data.tracks.items;

        console.log("Spotify tracks results", tracks);

        if (tracks.length == 1) {
          song = tracks[0];
          res.send("Found it.. use Hubot play 1 for “"+song.name+"” by "+song.artists[0].name);
          options.result = {first: tracks[0].uri};
        }
        else if (tracks.length == 2) {
          result = [
            "Use Hubot play 1 for “"+tracks[0].name+"” by "+tracks[0].artists[0].name,
            "or use Hubot play 2 for “"+tracks[1].name+"” by "+tracks[1].artists[0].name
          ];
          res.send(result.join("\n"));
          options.result = {first: tracks[0].uri, second: tracks[1].uri};
        }
        else if (tracks.length > 2) {
          result = [
            "Use Hubot play 1 for “"+tracks[0].name+"” by "+tracks[0].artists[0].name,
            "or use Hubot play 2 for “"+tracks[1].name+"” by "+tracks[1].artists[0].name,
            "or play 3 for “"+tracks[2].name+"” by "+tracks[2].artists[0].name
          ];
          res.send(result.join("\n"));
          options.result = {first: tracks[0].uri, second: tracks[1].uri, third: tracks[2].uri};
        }
        else if (data.tracks.length < 1) {
          res.send("I couldn’t find that song", 404);
        }
        break;

      // can't play a song by album or artist at this moment... maybe in the feature
      case "album":
        var album = data.albums.items[0];

        console.log("Spotify album results", album);

        if (album) {
          options.result = {first: album.uri};
          return res.send("Found an album by the name of "+album.name+". Hubot play 1 to play it.");
        }

        res.send("Couldn’t find that album.", 404);
        break;

      case "artist":
        var artist = data.artists.items[0];

        console.log("Spotify artist results", artist);

        if (artist) {
          song = tracks[0];
          res.send("Found it.. use Hubot play 1 for “"+song.name+"” by "+song.artists[0].name);
          options.result = {first: artist.uri};
          return res.send("Got it. Use Hubot play 1 for "+artist.name+".");
        }

        res.send("Couldn’t find that artist.", 404);
        break;

      default:
        res.send("I’ve no idea", 404);
    }
  });
});

// play a track or add a searched song to the play queue and play it
app.post('/play/:id', function (req, res) {
  var id = req.params.id;

  console.log("Play: "+ id);

  switch(id) {
    case "1":
      if (_.isObject(options.result) && _.isString(options.result.first)) {
        sh('osascript -e \'tell app "Spotify" to play track "'+ options.result.first +'"\'');
      }
      res.send("Okay, sure why not");
      break;

    case "2":
      if (_.isObject(options.result) && _.isString(options.result.second)) {
        sh('osascript -e \'tell app "Spotify" to play track "'+ options.result.second +'"\'');
      }
      res.send("Hah, this is my favorite song");
      break;

    case "3":
      if (_.isObject(options.result) && _.isString(options.result.third)) {
        sh('osascript -e \'tell app "Spotify" to play track "'+ options.result.third +'"\'');
      }
      res.send("Are you really sure? Okay, I'll play it anyway");
      break;

    default:
      spotify.search({
        type: "track",
        query: id
      }, function(err, data) {
        if (err) return res.send("whoops", 400);

        var song = data.tracks.items[0];

        if (song) {
          sh('osascript -e \'tell app "Spotify" to play track "'+ song.uri +'"\'');
          res.send("Found it, playing: “"+song.name+"” by "+song.artists[0].name+" from "+song.album.name);
        }
        else {
          res.send("Couldn’t find that track.", 404);
        }
      });
  }
});



var server = app.listen(port, "0.0.0.0", function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
