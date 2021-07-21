# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build-env

WORKDIR /build

# Make sure node js and yarn are installed
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt remove cmdtest
RUN apt remove yarn

RUN apt-get update && apt-get install -y nodejs yarn

COPY ./src .

ENV PATH="${PATH}:/root/.dotnet/tools"

RUN dotnet tool install --global dotnet-ef

# ?
RUN cd MGME.Infra && dotnet ef database update -s ../MGME.Web

RUN dotnet publish "MGME.Web/MGME.Web.csproj" -c release -o /publish --no-cache

# We use sdk image for multi-staged builds to make dotnet CLI available
FROM mcr.microsoft.com/dotnet/sdk:5.0

COPY --from=build-env /publish .

# For rebuilds on changes
ENV DOTNET_USE_POLLING_FILE_WATCHER=true

COPY ./docker/application/entrypoint.sh .

# # Entrypoint waits for postgres, runs the migrations and then dotnet-watch-runs the dll
RUN chmod +x entrypoint.sh
CMD bin/bash entrypoint.sh