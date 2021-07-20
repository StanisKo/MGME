# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build

WORKDIR /mgme

# Make sure dotnet-ef is installed
RUN dotnet tool install --global dotnet-ef

# Make sure dotnet CLI is available
ENV PATH="${PATH}:/root/.dotnet/tools"

# Make sure node js and yarn are installed
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt remove cmdtest
RUN apt remove yarn

RUN apt-get update && apt-get install -y nodejs yarn wget

# setup and install dockerize
ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

# Build from MGME.Web.csproj
COPY ./src .

RUN dotnet publish "MGME.Web/MGME.Web.csproj" -c release -o /publish --no-cache

# Build image with asp net core runtime
FROM mcr.microsoft.com/dotnet/aspnet:5.0

# Copy the published app to this new runtime-only container
COPY --from=build /publish .

# Allow container to ping the entrypoint that runs migrations and boots the project
COPY ./docker/application/entrypoint.sh .
RUN chmod +x entrypoint.sh
