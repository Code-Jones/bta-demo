# ---------------------------------------------------------------------------
# BTA Demo - Makefile
# ---------------------------------------------------------------------------
# Frontend: bta-demo-ui (Vite + React + Bun)
# Backend:  BtaDemo.Api (.NET 10)
# Database: PostgreSQL (Docker)
# ---------------------------------------------------------------------------

.PHONY: help install dev build clean lint db-up db-down db-reset api ui migrate migration preview seed

# Default target
help:
	@echo "BTA Demo - available targets:"
	@echo ""
	@echo "  make install     Install deps (UI + API) and start DB"
	@echo "  make dev         Start API and UI in development (run in separate terminals or use 'make api' and 'make ui')"
	@echo "  make api         Run the .NET API (dev server)"
	@echo "  make ui          Run the Vite dev server (frontend)"
	@echo "  make build       Build API and UI for production"
	@echo "  make lint        Lint frontend (ESLint)"
	@echo "  make clean       Remove build artifacts (bin, obj, node_modules, dist)"
	@echo ""
	@echo "Database (Docker):"
	@echo "  make db-up       Start PostgreSQL"
	@echo "  make db-down     Stop PostgreSQL"
	@echo "  make db-reset    Drop + recreate database"
	@echo ""
	@echo "EF Core migrations:"
	@echo "  make migrate     Apply pending migrations"
	@echo "  make migration   Add a new migration (usage: make migration name=MyMigration)"
	@echo ""
	@echo "Other:"
	@echo "  make preview     Serve production UI build (after 'make build')"
	@echo "  make seed        Load demo seed data"

# ---------------------------------------------------------------------------
# Setup & install
# ---------------------------------------------------------------------------
install: db-up
	cd bta-demo-ui && bun install
	cd BtaDemo.Api && dotnet restore
	@echo "Done. Start dev with: make api (in one terminal) and make ui (in another)."

# ---------------------------------------------------------------------------
# Development
# ---------------------------------------------------------------------------
api:
	cd BtaDemo.Api && dotnet run

ui:
	cd bta-demo-ui && bun run dev

# Run both (API in background). Use 'make api' and 'make ui' in two terminals for better DX.
dev: db-up
	@echo "Start API and UI in separate terminals: make api  &&  make ui"

# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------
build:
	cd BtaDemo.Api && dotnet publish -c Release -o out
	cd bta-demo-ui && bun run build
	@echo "API output: BtaDemo.Api/out"
	@echo "UI output:  bta-demo-ui/dist"

# ---------------------------------------------------------------------------
# Lint
# ---------------------------------------------------------------------------
lint:
	cd bta-demo-ui && bun run lint

# ---------------------------------------------------------------------------
# Database (Docker)
# ---------------------------------------------------------------------------
db-up:
	docker compose up -d db

db-down:
	docker compose down

db-reset: db-up
	cd BtaDemo.Api && dotnet ef database drop -f
	cd BtaDemo.Api && dotnet ef database update

# ---------------------------------------------------------------------------
# EF Core migrations
# ---------------------------------------------------------------------------
migrate: db-up
	cd BtaDemo.Api && dotnet ef database update

migration:
	@if [ -z "$(name)" ]; then echo "Usage: make migration name=YourMigrationName"; exit 1; fi
	cd BtaDemo.Api && dotnet ef migrations add $(name)

# ---------------------------------------------------------------------------
# Preview & clean
# ---------------------------------------------------------------------------
preview:
	cd bta-demo-ui && bun run preview

seed: migrate
	cd BtaDemo.Seed && dotnet run

clean:
	rm -rf BtaDemo.Api/bin BtaDemo.Api/obj BtaDemo.Api/out
	rm -rf bta-demo-ui/node_modules bta-demo-ui/dist
	@echo "Cleaned build artifacts."
