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

# Build from MGME.Web.csproj
COPY ./src .

RUN dotnet publish "MGME.Web/MGME.Web.csproj" -c release -o /publish --no-cache

# We use sdk image for multi-staged builds to make dotnet CLI available
FROM mcr.microsoft.com/dotnet/sdk:5.0

# Copy the published app to this new runtime-only container
COPY --from=build-env /publish .

ENTRYPOINT ["dotnet", "MGME.Web.dll"]


# Some fucking revelations about .NET
# https://docs.docker.com/samples/aspnet-mssql-compose/
# https://stackoverflow.com/questions/66988943/could-not-execute-because-the-application-was-not-found-or-a-compatible-net-sdk