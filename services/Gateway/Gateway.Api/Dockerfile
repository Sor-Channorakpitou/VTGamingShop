# Build context: the services/ folder (see deploy/docker-compose.yml).
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY Shared/VTGamingShop.Auth/VTGamingShop.Auth.csproj Shared/VTGamingShop.Auth/
COPY Gateway/Gateway.Api/Gateway.Api.csproj Gateway/Gateway.Api/
RUN dotnet restore Gateway/Gateway.Api/Gateway.Api.csproj
COPY Shared/VTGamingShop.Auth/ Shared/VTGamingShop.Auth/
COPY Gateway/Gateway.Api/ Gateway/Gateway.Api/
RUN dotnet publish Gateway/Gateway.Api/Gateway.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "Gateway.Api.dll"]
