#!/bin/bash

# stop & remove all container
docker-compose down -v

# remove all volume not using
docker volume prune -f

# remove container & volume then rebuild all
docker-compose down -v
docker-compose up --build -d
