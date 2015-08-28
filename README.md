# Spotify Mac API

HTTP API to control a spotify player on Mac OS. This is useful if you want to write scripts to control the music in your office from [Hubot](https://hubot.github.com/)


## Running the API server

```sh
$ npm i -g spotify-mac-api
$ spotify-mac-api -p 3344 -s myWonderfulSekret
```

## Making your server publicly available

Use [ngrok](https://ngrok.com/docs) to expose the server on the web

```sh
$ ngrok http 3344
```

## API endpoints

### Security

Currently there is a rather basic shared secret used to control access, pass the `secret` param with all requests. You can set this when running `spotify-mac-api -s MySharedSecret`

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

**type** - track, artist or album
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


## Inspiration

Inspired by [Hubot-spotify](https://github.com/davidvanleeuwen/hubot-spotify/blob/master/spotify.coffee)

## License

Copyright (c) 2015 Alternate Labs Ltd

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
