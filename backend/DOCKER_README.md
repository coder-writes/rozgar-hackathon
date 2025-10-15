# Docker Setup for Rozgar Backend

This guide explains how to build and run the Rozgar backend using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, for easier setup)

## Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Make sure your `.env` file is configured** with all required environment variables:
   ```
   PORT=4000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   SENDER_EMAIL=your_sender_email
   ```

2. **Build and start the container:**
   ```bash
   docker-compose up -d
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Stop the container:**
   ```bash
   docker-compose down
   ```

### Option 2: Using Docker CLI

1. **Build the Docker image:**
   ```bash
   docker build -t rozgar-backend .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     --name rozgar-backend \
     -p 4000:4000 \
     -e MONGODB_URI="your_mongodb_uri" \
     -e JWT_SECRET="your_jwt_secret" \
     -e SMTP_USER="your_smtp_user" \
     -e SMTP_PASS="your_smtp_password" \
     -e SENDER_EMAIL="your_sender_email" \
     -v $(pwd)/uploads:/app/uploads \
     rozgar-backend
   ```

3. **View logs:**
   ```bash
   docker logs -f rozgar-backend
   ```

4. **Stop the container:**
   ```bash
   docker stop rozgar-backend
   docker rm rozgar-backend
   ```

## Environment Variables

The following environment variables are required:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port for the server | `4000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/rozgar` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_key` |
| `SMTP_USER` | SMTP username for emails | `user@smtp-provider.com` |
| `SMTP_PASS` | SMTP password | `password123` |
| `SENDER_EMAIL` | Email address for sending emails | `noreply@rozgar.com` |
| `MAX_FILE_SIZE` | Maximum file upload size in bytes | `5242880` (5MB) |
| `ALLOWED_FILE_TYPES` | Allowed MIME types for uploads | `application/pdf,application/msword` |
| `NODE_ENV` | Environment mode | `production` or `development` |

## Docker Image Details

- **Base Image:** `node:20-alpine` (lightweight Node.js 20 LTS)
- **Working Directory:** `/app`
- **Exposed Port:** `4000`
- **Health Check:** Built-in health check running every 30 seconds

## Volumes

The container mounts the `uploads` directory to persist uploaded files:
- Host: `./uploads`
- Container: `/app/uploads`

This ensures that uploaded resumes and other files are not lost when the container restarts.

## Production Deployment

### Best Practices

1. **Use Environment Variables:** Never hardcode secrets in the Dockerfile or docker-compose.yml
2. **Use Docker Secrets** (for Docker Swarm):
   ```bash
   docker secret create mongodb_uri mongodb_uri.txt
   ```

3. **Enable HTTPS:** Use a reverse proxy like Nginx or Traefik
4. **Set Resource Limits:**
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 512M
       reservations:
         cpus: '0.5'
         memory: 256M
   ```

5. **Use Multi-stage Builds** for smaller images (already optimized in the Dockerfile)

### Docker Hub Deployment

1. **Tag the image:**
   ```bash
   docker tag rozgar-backend your-dockerhub-username/rozgar-backend:latest
   ```

2. **Push to Docker Hub:**
   ```bash
   docker login
   docker push your-dockerhub-username/rozgar-backend:latest
   ```

3. **Pull and run on production:**
   ```bash
   docker pull your-dockerhub-username/rozgar-backend:latest
   docker run -d -p 4000:4000 --env-file .env your-dockerhub-username/rozgar-backend:latest
   ```

## Troubleshooting

### Check if container is running
```bash
docker ps
```

### View container logs
```bash
docker logs rozgar-backend
```

### Access container shell
```bash
docker exec -it rozgar-backend sh
```

### Check health status
```bash
docker inspect --format='{{.State.Health.Status}}' rozgar-backend
```

### Rebuild after code changes
```bash
docker-compose build --no-cache
docker-compose up -d
```

## Development Mode

For development with hot-reload, it's recommended to run the backend directly with `npm run dev` instead of using Docker. Docker is primarily for production deployments.

However, if you want to use Docker for development:

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  backend:
    build: .
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev
```

Run with:
```bash
docker-compose -f docker-compose.dev.yml up
```

## Network Configuration

The backend uses a custom Docker network (`rozgar-network`) for container communication. This is useful when adding other services like:
- Frontend container
- Redis for caching
- MongoDB (if not using Atlas)

## Support

For issues or questions:
1. Check logs: `docker logs rozgar-backend`
2. Verify environment variables are set correctly
3. Ensure MongoDB is accessible from the container
4. Check network connectivity: `docker exec rozgar-backend ping google.com`
