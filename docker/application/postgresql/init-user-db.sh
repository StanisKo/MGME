#!/bin/bash
set -e

# Create a new database and user and grant all privileges to that user
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DATABASE" <<-EOSQL
    CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    CREATE DATABASE $DB_DATABASE;
    GRANT ALL PRIVILEGES ON DATABASE $DB_DATABASE TO $DB_USER;
EOSQL