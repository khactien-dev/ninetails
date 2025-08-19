docker build  -t localhost:5000/ninetails-fe:development -f ./docker/development/Dockerfile .

docker push localhost:5000/ninetails-fe:development

# shellcheck disable=SC2164
cd docker/development

docker compose down

docker compose up
