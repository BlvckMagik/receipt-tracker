#!/bin/bash
docker pull ghcr.io/blvckmagik/receipt-api:latest
docker pull ghcr.io/blvckmagik/receipt-web:latest
docker compose -f ~/Documents/receipt-tracker/docker-compose.yml down
docker compose -f ~/Documents/receipt-tracker/docker-compose.yml up -d