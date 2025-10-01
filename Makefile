.PHONY: help build up down restart scale-2 scale-5 logs setup

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Setup environment (create .env if not exists)
	@if [ ! -f .env ]; then cp .env.example .env; echo ".env created from .env.example"; fi

build: setup ## Build all services
	docker-compose build

up: setup ## Start all services
	docker-compose up -d

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

scale-2: ## Scale API to 2 instances
	docker-compose up -d --scale api=2

scale-5: ## Scale API to 5 instances
	docker-compose up -d --scale api=5

logs: ## Show logs
	docker-compose logs -f