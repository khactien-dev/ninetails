docker build -t localhost:5000/base-metric-service:latest -f ./apps/base-metric-service/Dockerfile .
docker build -t localhost:5000/form-request-service:latest -f ./apps/form-request-service/Dockerfile .
docker build -t localhost:5000/location-service:latest -f ./apps/location-service/Dockerfile .
docker build -t localhost:5000/user-service:latest -f ./apps/user-service/Dockerfile .
docker build -t localhost:5000/master-service:latest -f ./apps/master-service/Dockerfile .
docker build -t localhost:5000/notification-service:latest -f ./apps/notification-service/Dockerfile .

docker push localhost:5000/user-service:latest

docker push localhost:5000/form-request-service:latest

docker push localhost:5000/location-service:latest

docker push localhost:5000/base-metric-service:latest

docker push localhost:5000/master-service:latest

docker push localhost:5000/notification-service:latest