#!/bin/bash

set -e

if [ -z "$1" ]
  then
    echo "No argument supplied: you must specify a filename to use as kong configuration"
    exit 127
fi

echo "Waiting for DB..."
#Wait for Kong DB to come up
wait-for $KONG_PG_HOST:$KONG_PG_PORT -- echo "DB Ready."

kong migrations reset -y || kong migrations bootstrap -v

# We start and redirect everything to /dev/null
# to reduce clutter on stdout
kong start > kong.log 2>&1 &

# We need to know what file to pass for importing as config
kong config db_import $1
kong reload

echo "Setup Complete."
echo "Ready to accept connections!"

./printReminders.sh

tail -f kong.log