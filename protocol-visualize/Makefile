SHELL := /bin/bash

ROOT_DIR := $(abspath ..)
PROJECT_DIR := $(abspath .)
BACKEND_DIR := $(PROJECT_DIR)/backend
FRONTEND_DIR := $(PROJECT_DIR)/frontend
ANALYZER_DIR := $(PROJECT_DIR)/opentrons-robot-analysis
LOG_DIR := $(PROJECT_DIR)/.logs

BACKEND_PORT ?= 8000
FRONTEND_PORT ?= 5173
ANALYZER_PORT ?= 7860
OT2_PORT ?= 31950
FLEX_PORT ?= 31951
VITE_API_BASE_URL ?= http://127.0.0.1:$(BACKEND_PORT)

.PHONY: help
help:
	@echo "Available targets:"
	@echo "  make setup            # install/update dependencies for all services"
	@echo "  make up               # start OT-2, Flex, analyzer, backend, and frontend together"
	@echo "  make compose-up       # start analyzer and backend with docker compose"
	@echo "  make compose-down     # stop docker compose services"
	@echo "  make compose-logs     # tail docker compose logs"
	@echo "  make dev-ot2          # start OT-2 robot-server only"
	@echo "  make dev-flex         # start Flex robot-server only"
	@echo "  make dev-analyzer     # start analyzer service only"
	@echo "  make dev-backend      # start backend service only"
	@echo "  make dev-frontend     # start frontend service only"
	@echo "  make health           # check backend and analyzer health endpoints"

.PHONY: setup
setup: root-install robot-server-setup analyzer-setup backend-setup frontend-setup

.PHONY: root-install
root-install:
	cd $(ROOT_DIR) && yarn install

.PHONY: robot-server-setup
robot-server-setup:
	cd $(ROOT_DIR) && uv run make -C robot-server setup

.PHONY: analyzer-setup
analyzer-setup:
	cd $(ANALYZER_DIR) && uv venv && source .venv/bin/activate && uv pip install -r requirements.txt

.PHONY: backend-setup
backend-setup:
	cd $(BACKEND_DIR) && uv venv && source .venv/bin/activate && uv pip install -r requirements.txt

.PHONY: frontend-setup
frontend-setup:
	cd $(FRONTEND_DIR) && yarn install

.PHONY: dev-ot2
dev-ot2:
	cd $(ROOT_DIR) && make -C robot-server dev-ot2 dev_host=127.0.0.1 dev_port=$(OT2_PORT)

.PHONY: dev-flex
dev-flex:
	cd $(ROOT_DIR) && make -C robot-server dev-flex dev_host=127.0.0.1 dev_port=$(FLEX_PORT)

.PHONY: dev-analyzer
dev-analyzer:
	cd $(ANALYZER_DIR) && source .venv/bin/activate && uvicorn api:app --host 0.0.0.0 --port $(ANALYZER_PORT)

.PHONY: dev-backend
dev-backend:
	cd $(BACKEND_DIR) && source .venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port $(BACKEND_PORT)

.PHONY: dev-frontend
dev-frontend:
	cd $(FRONTEND_DIR) && VITE_API_BASE_URL=$(VITE_API_BASE_URL) yarn dev --host 0.0.0.0 --port $(FRONTEND_PORT)

.PHONY: up
up:
	@mkdir -p $(LOG_DIR)
	@echo "Starting protocol-visualize stack..."
	@echo "Logs: $(LOG_DIR)"
	@echo "Frontend: http://127.0.0.1:$(FRONTEND_PORT)"
	@echo "Backend:  http://127.0.0.1:$(BACKEND_PORT)/health"
	@echo "Analyzer: http://127.0.0.1:$(ANALYZER_PORT)/robot/health"
	@bash -lc 'set -euo pipefail; \
		trap "jobs -pr | xargs -r kill; wait" EXIT INT TERM; \
		cd "$(ROOT_DIR)" && make -C robot-server dev-ot2 dev_host=127.0.0.1 dev_port=$(OT2_PORT) > "$(LOG_DIR)/ot2.log" 2>&1 & \
		cd "$(ROOT_DIR)" && make -C robot-server dev-flex dev_host=127.0.0.1 dev_port=$(FLEX_PORT) > "$(LOG_DIR)/flex.log" 2>&1 & \
		cd "$(ANALYZER_DIR)" && source .venv/bin/activate && uvicorn api:app --host 0.0.0.0 --port $(ANALYZER_PORT) > "$(LOG_DIR)/analyzer.log" 2>&1 & \
		cd "$(BACKEND_DIR)" && source .venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port $(BACKEND_PORT) > "$(LOG_DIR)/backend.log" 2>&1 & \
		cd "$(FRONTEND_DIR)" && VITE_API_BASE_URL=$(VITE_API_BASE_URL) yarn dev --host 0.0.0.0 --port $(FRONTEND_PORT) > "$(LOG_DIR)/frontend.log" 2>&1 & \
		wait'

.PHONY: health
health:
	@echo "Backend:"
	@curl -s http://127.0.0.1:$(BACKEND_PORT)/health || true
	@echo
	@echo "Analyzer:"
	@curl -s http://127.0.0.1:$(ANALYZER_PORT)/robot/health || true
	@echo

.PHONY: compose-up
compose-up:
	cd $(PROJECT_DIR) && docker compose up --build -d analyzer backend
	@echo "Backend:  http://127.0.0.1:$(BACKEND_PORT)/health"
	@echo "Analyzer: http://127.0.0.1:$(ANALYZER_PORT)/robot/health"

.PHONY: compose-down
compose-down:
	cd $(PROJECT_DIR) && docker compose down

.PHONY: compose-logs
compose-logs:
	cd $(PROJECT_DIR) && docker compose logs -f analyzer backend
