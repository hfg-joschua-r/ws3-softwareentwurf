#!/bin/sh

# stopping and deleting all containers:
docker container stop frontend
docker container rm frontend

docker container stop dataservice
docker container rm dataservice

docker container stop userservice
docker container rm userservice

docker container stop deviceservice
docker container rm deviceservice

# removing all images:
docker image rm glth/to_frontend
docker image rm glth/to_dataservice
docker image rm glth/to_userservice
docker image rm glth/to_deviceservice

# going to each subfolder and building + running every service in docker
cd userservice ||return
docker build . -t glth/to_userservice
docker run --rm -d --ip 127.0.0.1 -p 3002:3002/tcp --name userservice glth/to_userservice:latest

cd ..
cd dataservice ||return
docker build . -t glth/to_dataservice
docker run --rm -d --ip 127.0.0.1 -p 3000:3000/tcp --name dataservice glth/to_dataservice:latest

cd ..
cd deviceservice ||return
docker build . -t glth/to_deviceservice
docker run --rm -d --ip 127.0.0.1 -p 3001:3001/tcp --name deviceservice glth/to_deviceservice:latest

cd ..
cd frontend_gtlh ||return
docker build . -t glth/to_frontend
docker run --rm -d --ip 127.0.0.1 -p 8080:80/tcp --name frontend glth/to_frontend:latest

