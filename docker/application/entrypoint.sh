#!/bin/bash

set -e

# ?
# export PATH="$PATH:/root/.dotnet/tools"

# dotnet tool install --global dotnet-ef

# dotnet ef database update

# Run dll
run_cmd="dotnet watch run --project MGME.Web.dll"

printf "%s" "Waiting for database ..."

while ! timeout 0.2 ping -c 1 -n 127.0.0.1:$SQL_PORT &> /dev/null
do
    printf "%c" "."
done

printf "\n%s\n" "Database is up, running migrations ..."

until dotnet ef database update; do
>&2 echo "."
sleep 1
done

printf "\n%s\n" "All migrations are applied, starting the server ..."

exec $run_cmd
