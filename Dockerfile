# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build-env
WORKDIR /MGME

# Make sure node is installed
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs

# Restore from csproj in MGME.Web as it references both Core and Infra
COPY ./MGME.MGME.Web/*.csproj .
RUN dotnet restore

# Copy everything else and build
COPY . .
WORKDIR /MGME
RUN dotnet publish -c release -o published --no-cache

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:5.0
WORKDIR /app
COPY --from=MGME /MGME/published ./
ENTRYPOINT ["dotnet", "MGME.Web.dll"]