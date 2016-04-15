### installation

1. Install mongodb: `brew install mongodb`
2. Run mongo: `mongo`. If this doesn't work, first try: `brew services start mongodb`
3. Install nodejs.
4. Install npm modules: `npm install`



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