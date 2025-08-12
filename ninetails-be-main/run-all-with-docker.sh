docker build -t base-metric-service:latest -f ./apps/base-metric-service/Dockerfile.dev .
docker build -t form-request-service:latest -f ./apps/form-request-service/Dockerfile.dev .
docker build -t location-service:latest -f ./apps/location-service/Dockerfile.dev .
docker build -t user-service:latest -f ./apps/user-service/Dockerfile.dev .
docker build -t api-docs-service:latest -f ./apps/api-docs/Dockerfile.dev .
docker build -t master-service:latest -f ./apps/master-service/Dockerfile.dev .

docker compose up
