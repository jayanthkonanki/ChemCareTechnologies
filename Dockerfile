FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy the rest of the frontend code and build
COPY frontend/ ./
RUN npm run build

# Use Nginx to serve the static files
FROM nginx:alpine

# Copy the built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom nginx config if needed (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
