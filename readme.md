### installation

1. Install mongodb: `brew install mongodb`
2. Install nodejs.
3. Install npm modules: `npm install`

### running

1. Run mongo: `mongo`. If this doesn't work, first try: `brew services start mongodb` 
2. Run server: `node server.js`.
3. Go to `http://localhost:3000/?q=kyle` or `http://localhost:3000/?q=lauren`.

### endpoints
* `/?q=kyle, /?q=lauren` - installation projection
* `/get_clips?off=N` - N is milliseconds since start
* `/reset_db` - just what you'd guess

### data structure
```
{
  _id: "57155ae66d05a52d7d6d0794",
  path: "/footage/watching_lauren/2014-June-27_16_36_8_+85.mov",
  type: "watching",
  person: "lauren",
  startoff: 146168000,
  endoff: 146253000,
  duration: 85000
}

{
  _id: "57155ae66d05a52d7d6d05dd",
  path: "/footage/watched_kyle/2014-June-27_16_36_8_+85.mp4",
  type: "watched",
  person: "kyle",
  startoff: 146168000,
  endoff: 146253000,
  duration: 85000
}
```

### documentation

* https://github.com/mongodb/node-mongodb-native



### command line hints

convert .mov to .mp4
```
for i in *.mov ; do 
    ffmpeg -i "$i" -acodec copy -vcodec copy $(basename "${i/.mov}").mp4 
    sleep 1
done
```

replace all space with underscore
```
for file in *; do mv "$file" `echo $file | tr ' ' '_'` ; done
```
