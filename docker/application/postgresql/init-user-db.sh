#!/bin/bash
set -e

# Create a new database and user and grant all privileges to that user
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DATABASE" <<-EOSQL
    CREATE USER $SQL_USER WITH PASSWORD '$POSTGRES_PASSWORD';
    CREATE DATABASE $POSTGRES_DATABASE;
    GRANT ALL PRIVILEGES ON DATABASE $SQL_DATABASE TO $POSTGRES_USER;
EOSQL