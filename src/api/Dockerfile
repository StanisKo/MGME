# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/sdk:5.0-buster-slim AS build-env

COPY . .

RUN dotnet publish "MGME.Web/MGME.Web.csproj" -c release -o /build --no-cache

FROM mcr.microsoft.com/dotnet/sdk:5.0-buster-slim

WORKDIR /api

COPY --from=build-env /build .

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait /wait

RUN chmod +x /wait

CMD /wait && cd MGME.Web && dotnet watch run MGME.Web.dll