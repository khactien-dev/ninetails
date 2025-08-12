ifndef u
u:=sotatek
endif

ifndef env
env:=dev
endif

init:
	cp .env.example .env
	npm install
	docker-compose up -d --build

docker-dev:
	docker-compose up -d

docker-build:
	docker-compose up -d --build

docker-down:
	docker-compose down

kill:
	docker-compose kill

killall:
	docker container kill $$(docker ps -q)

rebuild:
	bash rebuild.sh

run-all:
	bash run-all-with-docker.sh
