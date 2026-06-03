#!/bin/bash

# Exit on any error
set -e

echo "🚀 ChemCare Technologies Docker Build & Push Script"
echo "---------------------------------------------------"

# Ensure we are in the project root
cd "$(dirname "$0")/.."

# Ask for Docker Hub credentials and details
read -p "Enter your Docker Hub Username: " DOCKER_USER
if [ -z "$DOCKER_USER" ]; then
    echo "❌ Username is required!"
    exit 1
fi

IMAGE_NAME="chemcare-app"
TAG="latest"
FULL_IMAGE_NAME="$DOCKER_USER/$IMAGE_NAME:$TAG"

echo "📦 Building image: $FULL_IMAGE_NAME"
# Use the Dockerfile from cloud-deployment, but set context to project root
docker build -f cloud-deployment/Dockerfile -t $FULL_IMAGE_NAME .

echo "🔑 Logging into Docker Hub..."
docker login -u "$DOCKER_USER"

echo "⬆️ Pushing image to Docker Hub..."
docker push $FULL_IMAGE_NAME

echo "✅ Success!"
echo "Your image is pushed to: $FULL_IMAGE_NAME"
echo ""
echo "Next steps for Render deployment:"
echo "1. Go to https://dashboard.render.com/"
echo "2. Click 'New' -> 'Web Service'"
echo "3. Choose 'Deploy an existing image from a registry'"
echo "4. Enter the Image URL: $FULL_IMAGE_NAME"
echo "5. Deploy!"
