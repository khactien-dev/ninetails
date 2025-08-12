docker build -t ninetails-staging.kr.ncr.ntruss.com/base-metric-service:staging -f ./apps/base-metric-service/Dockerfile .
docker build -t ninetails-staging.kr.ncr.ntruss.com/form-request-service:staging -f ./apps/form-request-service/Dockerfile .
docker build -t ninetails-staging.kr.ncr.ntruss.com/location-service:staging -f ./apps/location-service/Dockerfile .
docker build -t ninetails-staging.kr.ncr.ntruss.com/user-service:staging -f ./apps/user-service/Dockerfile .
docker build -t ninetails-staging.kr.ncr.ntruss.com/master-service:staging -f ./apps/master-service/Dockerfile .
docker build -t ninetails-staging.kr.ncr.ntruss.com/notification-service:staging -f ./apps/notification-service/Dockerfile .

docker push ninetails-staging.kr.ncr.ntruss.com/user-service:staging
docker push ninetails-staging.kr.ncr.ntruss.com/form-request-service:staging
docker push ninetails-staging.kr.ncr.ntruss.com/location-service:staging
docker push ninetails-staging.kr.ncr.ntruss.com/base-metric-service:staging
docker push ninetails-staging.kr.ncr.ntruss.com/master-service:staging
docker push ninetails-staging.kr.ncr.ntruss.com/notification-service:staging

kubectl delete -f ./infra/staging/services/base-metric-service.yml
kubectl apply -f ./infra/staging/services/base-metric-service.yml
kubectl delete -f ./infra/staging/services/form-request-service.yml
kubectl apply -f ./infra/staging/services/form-request-service.yml
kubectl delete -f ./infra/staging/services/location-service.yml
kubectl apply -f ./infra/staging/services/location-service.yml
kubectl delete -f ./infra/staging/services/master-service.yml
kubectl apply -f ./infra/staging/services/master-service.yml
kubectl delete -f ./infra/staging/services/user-service.yml
kubectl apply -f ./infra/staging/services/user-service.yml

kubectl delete -f ./infra/staging/services/notification-service.yml
kubectl apply -f ./infra/staging/services/notification-service.yml