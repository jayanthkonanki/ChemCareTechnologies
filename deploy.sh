#!/bin/bash
# deploy.sh
# One-click script to build and run the ChemCareTechnologies docker container

IMAGE_NAME="chemcare-frontend"
CONTAINER_NAME="chemcare-app"
PORT=8080

echo "🚀 Stopping and removing existing container (if any)..."
docker stop $CONTAINER_NAME 2>/dev/null
docker rm $CONTAINER_NAME 2>/dev/null

echo "📦 Building Docker image..."
docker build -t $IMAGE_NAME .

echo "🏃 Starting new container on port $PORT..."
docker run -d --name $CONTAINER_NAME -p $PORT:80 $IMAGE_NAME

echo "✅ Deployment successful! Application is running at http://localhost:$PORT"
