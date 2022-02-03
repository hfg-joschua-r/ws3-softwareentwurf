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