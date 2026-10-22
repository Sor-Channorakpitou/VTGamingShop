# Build context: the services/ folder (see deploy/docker-compose.yml).
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY Catalog/Catalog.Api/Catalog.Api.csproj Catalog/Catalog.Api/
RUN dotnet restore Catalog/Catalog.Api/Catalog.Api.csproj
COPY Catalog/Catalog.Api/ Catalog/Catalog.Api/
RUN dotnet publish Catalog/Catalog.Api/Catalog.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "Catalog.Api.dll"]
