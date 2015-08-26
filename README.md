# Spotify Control API

Run this locally on a mac and it provides you with an HTTP API to control a local spotify instance. This is useful if you want to write scripts to control the music in your office from [Hubot](https://hubot.github.com/) etc.

## API

The following endpoints are available:

### POST /(play/pause/toggle)

Toggles play/pause

### POST /next

Plays the next track and returns the next tracks name.

### POST /prev

Plays the previous track and returns the previous tracks name.

### POST /playing

Returns the currently playing tracks name

### POST /mute

Toggles muting the volume

### POST /search?type=track&query=mr%20brightside

**type** - one of track, artist or album
**query** - the search query

Returns response text to queue up a play

### POST /play/track/:name

**name** - name of the song to find and play

### POST /play/artist/:name

**name** - name of the artist to find and play

### POST /play/album/:name

**name** - name of the album to find and play

### POST /play/queue/:id

**id** - ID of the song to play from search results


## Running your local host on the www

Use forever to run the server

```sh
$ npm i -g forever
$ forever start server.js
```

Use [ngrok](https://ngrok.com/docs) to expose the server on the web

```sh
# Start one off
$ ngrok http -subdomain=mysubdodmainname 3344
```

For easier use you can use the ngrok config file in `~/.ngrok2/ngrok.yml` and make the contents something like:

```yml
authtoken: some-sekret-token
tunnels:
  spotify_api:
    proto: http
    addr: 3344
    subdomain: your-ngrok-subdomain
```

Once this is setup you can start ngrok with:

```sh
$ ngrok start spotify_api
```
