#!/bin/bash
set -e

# Create a new database and user and grant all privileges to that user
psql -v ON_ERROR_STOP=1 --username "$SQL_USER" --dbname "$SQL_DATABASE" <<-EOSQL
    CREATE USER $SQL_USER WITH PASSWORD '$SQL_PASSWORD';
    CREATE DATABASE $SQL_DATABASE;
    GRANT ALL PRIVILEGES ON DATABASE $SQL_DATABASE TO $SQL_USER;
EOSQL