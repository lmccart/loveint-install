#!/bin/bash
cd /Users/lmccart/Desktop/LOVEINT
/usr/local/bin/forever stopall
/usr/local/bin/forever start -o logs/out.log -e logs/err.log --spinSleepTime 1000 --minUptime 5000 server.js
sleep 10
./extra/start_all.exp
