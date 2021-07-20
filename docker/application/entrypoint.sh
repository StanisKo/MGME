#!/bin/bash
CYAN="\033[0;36m"
TRANS="\033[0m"

set -e
run_cmd="dotnet run --no-build --urls http://0.0.0.0:${APP_PORT} -v d"

export PATH="$PATH:/root/.dotnet/tools"

printf "\n${CYAN}Waiting for Database...${TRANS}\n"
dockerize -wait tcp://${SQL_HOST:-database}:{$SQL_PORT-5432} -timeout 30s

printf "\n${CYAN}Applying database migrations...${TRANS}\n"
dotnet ef database update
printf "${CYAN}...finished applying database migrations.${TRANS}\n"

printf "\n${CYAN}Starting server...${TRANS}\n"
printf "\n${CYAN}Running: $run_cmd${TRANS}\n"

exec $run_cmd