# Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY BtaDemo.Seed/ ./BtaDemo.Seed/
COPY BtaDemo.Api/ ./BtaDemo.Api/
WORKDIR /src/BtaDemo.Seed
RUN dotnet restore
RUN dotnet publish -c Release -o /out

# Run
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /out .
ENTRYPOINT ["dotnet", "BtaDemo.Seed.dll"]
