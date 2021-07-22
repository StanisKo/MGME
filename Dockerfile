# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build-env

WORKDIR /mgme

# Make sure dotnet tools are avaialable
ENV PATH="${PATH}:/root/.dotnet/tools"

# Install EF Core CLI
RUN dotnet tool install --global dotnet-ef

COPY ./src .

# Make sure node js and yarn are installed so we can build front end assets
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt remove cmdtest
RUN apt remove yarn
RUN apt-get update && apt-get install -y nodejs yarn

# Build binaries and front end assets (Duct tape, rewrite Dockerfile properly)
RUN cd MGME.Web && dotnet build && dotnet restore && cd ClientApp && yarn install && yarn upgrade && yarn build

# RUN dotnet publish "MGME.Web/MGME.Web.csproj" -c release -o /publish --no-cache

# We use sdk image for multi-staged builds to make dotnet CLI available: If migrations from top are OK, use
# aspnetcore runtime to build runtime image
# FROM mcr.microsoft.com/dotnet/sdk:5.0

# COPY --from=build-env /publish .

# For rebuilds on changes
ENV DOTNET_USE_POLLING_FILE_WATCHER=true

COPY ./docker/application/entrypoint.sh .

# # Entrypoint waits for postgres, runs the migrations and then dotnet-watch-runs the dll
RUN chmod +x entrypoint.sh
CMD /bin/bash entrypoint.sh

# Resources on running migrations against dll:
# https://github.com/dotnet/efcore/issues/16882
# https://stackoverflow.com/questions/37562122/is-there-a-way-to-run-ef-core-rc2-tools-from-published-dll/59269689#59269689
# https://github.com/marketplace/actions/deploy-entity-framework-core-ef-core-migrations-from-a-dll
# https://www.benday.com/2017/12/19/ef-core-2-0-migrations-without-hard-coded-connection-strings/ look into dbContextDesignFactory (most probably it is required)

# THIS !!!!

# https://dotnetthoughts.net/docker-compose-asp-net-core-application/


# Create a separate light-weight container that will run migrations

# Then improve this file to use lighter only core runtime and not the whole sdk

# Then add watcher
