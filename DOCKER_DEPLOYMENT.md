# Docker Deployment Guide

## Architecture Overview

This docker-compose setup orchestrates three services:

1. **yoda-chat** - Chatbot API service (port 3000 internally)
2. **yoda-web** - Next.js frontend application (port 3000 internally)
3. **nginx** - Reverse proxy/router (ports 80/443 externally)

## Port Configuration

Both services run on port 3000 **internally** within Docker containers. Nginx handles external routing:

- **External Access**: Port 80 (HTTP) and 443 (HTTPS)
- **yoda-chat internal**: Port 3000 (only accessible via Docker network)
- **yoda-web internal**: Port 3000 (only accessible via Docker network)

## Routing Rules

Nginx routes requests based on URL patterns:

- `/chatbot/*` → Routes to `yoda-chat:3000`
- `/wechat` → Routes to `yoda-chat:3000`
- `/api/*` (except `/api/chatbot`) → Routes to `yoda-web:3000`
- `/_next/static/*` → Routes to `yoda-web:3000` (with caching)
- `/uploads/*` → Routes to `yoda-web:3000` (with caching)
- `/*` (everything else) → Routes to `yoda-web:3000`

## Environment Variables

Create a `.env` file in the project root with:

```env
# API2D/OpenAI Configuration
API2D_BASE_URL=https://openai.api2d.net
API2D_API_KEY=your_api_key_here
GPT_MODEL=gpt-3.5-turbo
MAX_TOKENS=1000
TEMPERATURE=0.7

# WeChat Configuration
WECHAT_TOKEN=your_wechat_token
WECHAT_APPID=your_wechat_appid
WECHAT_APPSECRET=your_wechat_appsecret

# Next.js Configuration
NEXTAUTH_URL=http://localhost
NEXTAUTH_SECRET=your_nextauth_secret
DATABASE_URL=your_database_url
NEXTAUTH_GITHUB_ID=your_github_id
NEXTAUTH_GITHUB_SECRET=your_github_secret
NEXT_PUBLIC_API_URL=http://localhost/api/v1
```

## Usage

### Build and Start Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f yoda-chat
docker-compose logs -f yoda-web
docker-compose logs -f nginx
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Rebuild Services

```bash
# Rebuild and restart
docker-compose up -d --build

# Rebuild specific service
docker-compose build yoda-chat
docker-compose up -d yoda-chat
```

## Health Checks

All services have health checks configured:

- **yoda-chat**: `GET /health`
- **yoda-web**: `GET /api/health`
- **nginx**: `nginx -t` (configuration test)

## Troubleshooting

### Check Service Status

```bash
docker-compose ps
```

### Check Service Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs yoda-chat
docker-compose logs yoda-web
docker-compose logs nginx
```

### Test Endpoints

```bash
# Test yoda-chat health
curl http://localhost/health

# Test yoda-chat chatbot
curl -X POST http://localhost/chatbot/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "Hello"}'

# Test yoda-web
curl http://localhost/
```

### Network Issues

If services can't communicate:

1. Check if they're on the same network:
   ```bash
   docker network inspect yoda-network
   ```

2. Test connectivity from within a container:
   ```bash
   docker exec -it yoda-chat ping yoda-web
   docker exec -it nginx ping yoda-chat
   ```

## Production Considerations

1. **SSL/TLS**: Uncomment and configure the HTTPS server block in `nginx/nginx.conf`
2. **Environment Variables**: Use a secrets management system (e.g., Docker secrets, AWS Secrets Manager)
3. **Resource Limits**: Add resource limits to docker-compose.yml:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```
4. **Logging**: Configure centralized logging (e.g., ELK stack, CloudWatch)
5. **Monitoring**: Set up monitoring and alerting (e.g., Prometheus, Grafana)
6. **Backup**: Configure database backups if using persistent storage
