#!/bin/bash

if [ "$MODE_ENV" == "production" ]
then
    postgres -c stats_temp_directory=/tmp
else
  >&2 echo "Container is not in production mode: exiting."
  exit 0
fi
