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

### POST /play/:track

**track**
