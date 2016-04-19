### installation

1. Install mongodb: `brew install mongodb`
2. Install nodejs.
3. Install npm modules: `npm install`

### Running

1. Run mongo: `mongo`. If this doesn't work, first try: `brew services start mongodb` 
2. Run server: `node server.js`.
3. Go to http://localhost:3000/?q=kyle or http://localhost:3000/?q=lauren.

### Endpoints
* /?q=kyle, /?q=lauren - installation projection
* /get_clips?off=N - N is milliseconds since start
* /reset_db - just what you'd guess

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
