#!/bin/bash

set -e

# Wait for postgres to be up
while ! nc -z $SQL_HOST $SQL_PORT; do
  echo "Waiting for the database"
  sleep 1
done;

cd dotnet run --no-build --urls http://0.0.0.0:5001 -v d