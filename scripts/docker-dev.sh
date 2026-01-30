#!/bin/bash
# ============================================
# Nexus LMS - Local Development with Docker
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT/docker"

case "$1" in
    up)
        echo "Starting development environment..."
        docker-compose up -d
        echo ""
        echo "Services started:"
        echo "  - Client:   http://localhost:80"
        echo "  - Server:   http://localhost:3000"
        echo "  - PgAdmin:  http://localhost:5050"
        echo ""
        echo "Run 'docker-compose logs -f' to view logs"
        ;;
    down)
        echo "Stopping development environment..."
        docker-compose down
        ;;
    logs)
        docker-compose logs -f ${2:-}
        ;;
    build)
        echo "Building Docker images..."
        docker-compose build --no-cache
        ;;
    clean)
        echo "Cleaning up Docker resources..."
        docker-compose down -v --rmi local
        docker system prune -f
        ;;
    db-push)
        echo "Running Prisma db push..."
        docker-compose exec server npx prisma db push
        ;;
    db-migrate)
        echo "Running Prisma migrations..."
        docker-compose exec server npx prisma migrate deploy
        ;;
    shell)
        docker-compose exec ${2:-server} sh
        ;;
    *)
        echo "Usage: $0 {up|down|logs|build|clean|db-push|db-migrate|shell}"
        echo ""
        echo "Commands:"
        echo "  up        - Start all services"
        echo "  down      - Stop all services"
        echo "  logs      - View logs (optional: service name)"
        echo "  build     - Rebuild Docker images"
        echo "  clean     - Remove all containers and volumes"
        echo "  db-push   - Push Prisma schema to database"
        echo "  db-migrate - Run Prisma migrations"
        echo "  shell     - Open shell in container (default: server)"
        exit 1
        ;;
esac
