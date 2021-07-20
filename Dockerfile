# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build

# Allow container to ping the entrypoint that runs migrations and boots the project
RUN chmod +x ./docker/application/entrypoint.sh

WORKDIR /mgme

# Make sure node js and yarn are installed
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt remove cmdtest
RUN apt remove yarn

RUN apt-get update && apt-get install -y nodejs yarn

COPY ./src .

# Build from MGME.Web.csproj
RUN dotnet publish "MGME.Web/MGME.Web.csproj" -c release -o /app/publish --no-cache

# Build image with asp net core runtime
FROM mcr.microsoft.com/dotnet/aspnet:5.0

# Copy the published app to this new runtime-only container
COPY --from=build /app/publish .
