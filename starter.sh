#!/bin/sh

cd /var/www/slack-points
forever start slack.js >> logs/log.txt 2>&1
