#!/bin/sh
dir1=/usr/src/app/test/users.e2e-spec.ts
while inotifywait -e modify "$dir1"; do
	clear; npm run test:e2e
done
