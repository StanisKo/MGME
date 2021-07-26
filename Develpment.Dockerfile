# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build-env

WORKDIR /build

COPY ./src .

# Make sure node js and yarn are installed so we can build front end assets
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt remove cmdtest
RUN apt remove yarn
RUN apt-get update && apt-get install -y nodejs yarn

RUN cd MGME.Web && dotnet build && dotnet restore

RUN cd MGME.Web/ClientApp && yarn install && yarn build

FROM mcr.microsoft.com/dotnet/aspnet:5.0

WORKDIR /app

COPY --from=build-env . .

ENV DOTNET_USE_POLLING_FILE_WATCHER=true

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait /wait

RUN chmod +x /wait

CMD /wait && cd MGME.Web && dotnet watch run