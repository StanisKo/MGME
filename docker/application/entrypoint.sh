#!/bin/bash
CYAN="\033[0;36m"
TRANS="\033[0m"

set -e

# Run the compiled dll
run_cmd="dotnet MGME.Web.dll"

printf "\n${CYAN}Waiting for database${TRANS}\n"

# Wait for db with dockerize (Not found)
# dockerize -wait tcp://${SQL_HOST:-database}:{$SQL_PORT-5432} -timeout 30s

printf "\n${CYAN}Applying database migrations${TRANS}\n"

# Run migrations (CLI not found)
# dotnet ef database update

printf "${CYAN}Finished applying database migrations${TRANS}\n"

printf "\n${CYAN}Starting server${TRANS}\n"

printf "\n${CYAN}Running: $run_cmd${TRANS}\n"

exec "cd "
exec $run_cmd