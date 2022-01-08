#!/bin/bash

wait_for_db_container() {
  until pg_isready --dbname=$POSTGRES_DB --host=$POSTGRES_HOST --port=$POSTGRES_PORT --username=$POSTGRES_USER > /dev/null; do
    >&2 echo " ⏳  Waiting for Postgresql container to be ready..."
    sleep 2
  done

  >&2 echo " ✅  Postgres is up! --> Init database schema"
  tsc && typeorm schema:sync && npm run seed:run
  >&2 echo " ✅  Database is ready for backend"
}

if [ "$NODE_ENV" == "production" ]
then
    wait_for_db_container
else
  exit 0
fi
