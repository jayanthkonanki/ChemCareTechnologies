# Stage 1: Build the Vite React App
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy the rest of the frontend code and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the custom nginx config
COPY cloud-deployment/nginx.conf /etc/nginx/conf.d/default.conf

# Render handles dynamic port assignment, but default to 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
