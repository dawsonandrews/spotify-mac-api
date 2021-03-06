#! /usr/bin/env node

var args = require('minimist')(process.argv.slice(2), {
  alias: {
    'port': ['p', 'PORT'],
    'secret': ['s', 'SECRET']
  }
});
var _ = require('underscore');
var sh = require('sh');
var spotify = require('spotify');
var express = require('express');
var bodyParser = require('body-parser');

// Configuration
var port = args.port || process.env.PORT || 3344;
var secret = args.secret || process.env.SHARED_SECRET || "sekret";

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

// Ensure secret is correct
app.use(function(req, res, next) {
  var provided_secret = req.body.secret || req.query.secret;
  if (provided_secret === secret) {
    return next();
  }

  res.send("Secret does not match", 401);
});

// Handle errors
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

function currentTrack(callback) {
  var song = sh('osascript '+__dirname+'/src/scripts/current_song.scpt');
  song.result(function(track) {
    callback(track);
  });
}

app.get('/', function (req, res) {
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
          res.send("Found it.. use Hubot play queue 1 for “"+song.name+"” by "+song.artists[0].name);
          options.result = {first: tracks[0].uri};
        }
        else if (tracks.length == 2) {
          result = [
            "Use Hubot play queue 1 for “"+tracks[0].name+"” by "+tracks[0].artists[0].name,
            "or use Hubot play queue 2 for “"+tracks[1].name+"” by "+tracks[1].artists[0].name
          ];
          res.send(result.join("\n"));
          options.result = {first: tracks[0].uri, second: tracks[1].uri};
        }
        else if (tracks.length > 2) {
          result = [
            "Use Hubot play queue 1 for “"+tracks[0].name+"” by "+tracks[0].artists[0].name,
            "or use Hubot play queue 2 for “"+tracks[1].name+"” by "+tracks[1].artists[0].name,
            "or play queue 3 for “"+tracks[2].name+"” by "+tracks[2].artists[0].name
          ];
          res.send(result.join("\n"));
          options.result = {first: tracks[0].uri, second: tracks[1].uri, third: tracks[2].uri};
        }
        else if (tracks.length < 1) {
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
          options.result = {first: artist.uri};
          return res.send("Got it. Use Hubot play 1 for "+artist.name+".");
        }

        res.send("Couldn’t find that artist.", 404);
        break;

      case "playlist":
        var playlists = data.playlists.items;

        console.log("Spotify playlists results", playlists);


        if (playlists.length == 1) {
          song = playlists[0];
          res.send("Found it.. use Hubot play queue 1 for “"+song.name+"”");
          options.result = {first: playlists[0].uri};
          return;
        }
        else if (playlists.length == 2) {
          result = [
            "Use Hubot play queue 1 for “"+playlists[0].name+"”",
            "or use Hubot play queue 2 for “"+playlists[1].name+"”"
          ];
          res.send(result.join("\n"));
          options.result = {first: playlists[0].uri, second: playlists[1].uri};
          return;
        }
        else if (playlists.length > 2) {
          result = [
            "Use Hubot play queue 1 for “"+playlists[0].name+"”",
            "or use Hubot play queue 2 for “"+playlists[1].name+"”",
            "or play queue 3 for “"+playlists[2].name+"”"
          ];
          res.send(result.join("\n"));
          options.result = {first: playlists[0].uri, second: playlists[1].uri, third: playlists[2].uri};
          return;
        }

        res.send("Couldn’t find that playlist.", 404);
        break;

      default:
        res.send("I’ve no idea", 404);
    }
  });
});

// play a track or add a searched song to the play queue and play it
app.post('/play/:type/:id', function (req, res) {
  var id = req.params.id;
  var type = req.params.type;

  if (_.indexOf(['track', 'artist', 'album', 'queue', 'playlist'], type) < 0) {
    // default to artist
    type = "artist";
  }

  console.log("Play "+ type +": "+ id);

  if (type === "queue") {
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
        res.send("Use numbers 1 to 3");
    }
  }
  else {
    spotify.search({
      type: type,
      query: id
    }, function(err, data) {
      if (err) return res.send("whoops", 400);

      var uri_to_play, now_playing;

      switch(type) {
        case "track":
          var song = data.tracks.items[0];

          if (song) {
            now_playing = song.name;
            uri_to_play = song.uri;
          }

          break;

        case "artist":
          var artist = data.artists.items[0];

          if (artist) {
            uri_to_play = artist.uri;
            now_playing = artist.name;
          }

          break;

        case "album":
          var album = data.albums.items[0];

          if (album) {
            uri_to_play = album.uri;
            now_playing = album.name;
          }

          break;

        case "playlist":
          var playlist = data.playlists.items[0];

          if (playlist) {
            uri_to_play = playlist.uri;
            now_playing = playlist.name;
          }

          break;
      }

      if (_.isString(uri_to_play)) {
        sh('osascript -e \'tell app "Spotify" to play track "'+ uri_to_play +'"\'');
        res.send("Now playing: “"+now_playing+"”");
      }
      else {
        res.send("Whoops, couldn’t find that", 404);
      }
    });
  }
});



var server = app.listen(port, "0.0.0.0", function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Spotify control API listening at http://%s:%s', host, port);
});
