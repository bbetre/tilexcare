#!/bin/bash

# TilexCare Deployment Script
# Usage: ./deploy.sh [command]
# Commands:
#   start   - Build and start all services (default)
#   stop    - Stop all services
#   restart - Restart all services
#   logs    - View logs from all services
#   clean   - Stop and remove all containers, networks, and volumes
#   seed    - Seed the database with demo data

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_banner() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════╗"
    echo "║           TilexCare Deployer           ║"
    echo "║      Telehealth Platform v1.0.0        ║"
    echo "╚════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi
    
    print_status "Docker is running"
}

check_env() {
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            print_warning "No .env file found. Creating from .env.example..."
            cp .env.example .env
            print_status "Created .env file. Please review and update the values."
        else
            print_warning "No .env file found. Using default values from docker-compose.yml"
        fi
    else
        print_status "Environment file found"
    fi
}

start_services() {
    print_banner
    check_docker
    check_env
    
    echo ""
    print_status "Building and starting TilexCare..."
    echo ""
    
    docker compose up --build -d
    
    echo ""
    print_status "Waiting for services to be healthy..."
    
    # Wait for API to be healthy
    attempt=0
    max_attempts=30
    until docker compose ps api | grep -q "healthy" || [ $attempt -ge $max_attempts ]; do
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    echo ""
    
    if [ $attempt -ge $max_attempts ]; then
        print_warning "Services may still be starting. Check logs with: ./deploy.sh logs"
    else
        print_status "All services are healthy!"
    fi
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  TilexCare is now running!                             ║${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}║  🌐 Web App:    http://localhost:3000                  ║${NC}"
    echo -e "${GREEN}║  📡 API:        http://localhost:5000                  ║${NC}"
    echo -e "${GREEN}║  🗄️  Database:   localhost:5432                        ║${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}║  📝 To seed demo data: ./deploy.sh seed                ║${NC}"
    echo -e "${GREEN}║  📋 View logs:         ./deploy.sh logs                ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
}

stop_services() {
    print_banner
    print_status "Stopping TilexCare services..."
    docker compose down
    print_status "All services stopped"
}

restart_services() {
    print_banner
    print_status "Restarting TilexCare services..."
    docker compose restart
    print_status "All services restarted"
}

view_logs() {
    docker compose logs -f
}

clean_all() {
    print_banner
    print_warning "This will remove all containers, networks, and volumes (including database data)!"
    read -p "Are you sure? (y/N): " confirm
    
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        print_status "Cleaning up..."
        docker compose down -v --remove-orphans
        print_status "All resources removed"
    else
        print_status "Cancelled"
    fi
}

seed_database() {
    print_banner
    print_status "Seeding database with demo data..."
    
    # Check if API container is running
    if ! docker compose ps api | grep -q "running"; then
        print_error "API container is not running. Start services first with: ./deploy.sh start"
        exit 1
    fi
    
    docker compose exec api node scripts/seedData.js
    
    echo ""
    print_status "Database seeded successfully!"
    echo ""
    echo -e "${BLUE}Demo Accounts:${NC}"
    echo "  Admin:   admin@tilexcare.com / password123"
    echo "  Patient: patient@tilexcare.com / password123"
    echo "  Doctor:  doctor@tilexcare.com / password123"
}

# Main script
case "${1:-start}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        view_logs
        ;;
    clean)
        clean_all
        ;;
    seed)
        seed_database
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|clean|seed}"
        exit 1
        ;;
esac
