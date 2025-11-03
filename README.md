# Yoda Chat

A production-ready content-based chatbot AI Agent for WeChat integration using GPT via API2D/OpenAI.

## Features

- 🤖 AI-powered chatbot using GPT models via API2D/OpenAI
- 💬 WeChat public account integration
- 📝 Conversation history tracking (in-memory, Redis ready)
- 🎯 Content-based responses with context awareness
- 🔒 Security headers, CORS, and rate limiting
- 🛡️ Production-ready error handling
- 🚀 Docker and CI/CD ready
- ✅ Health checks and graceful shutdown

## Prerequisites

- Node.js 18+ (ES modules support)
- TypeScript 5.3+
- API2D account and API key
- WeChat public account (for WeChat integration)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Edit `.env` with your credentials:
   - `OPENAI_API_KEY`: Your OpenAI/API2D API key (required)
   - `OPENAI_BASE_URL`: API base URL (default: https://openai.api2d.net)
   - `WECHAT_TOKEN`: Your WeChat verification token (required for WeChat)
   - `WECHAT_APPID`: Your WeChat AppID (optional)
   - `WECHAT_APPSECRET`: Your WeChat AppSecret (optional)

## Usage

### Build the project:
```bash
npm run build
```

### Start the server:
```bash
npm start
```

### Development mode (with auto-reload):
```bash
npm run dev
```

The server will start on port 3000 (or the port specified in `.env`).

## API Endpoints

**Base URL:** `http://localhost:3000`  
**API Prefix:** `/api/chat` (unique namespace to avoid conflicts with yoda-app's `/api/v1/`)

### WeChat Integration

- **GET `/api/chat/wx`** - WeChat server verification
- **POST `/api/chat/wx`** - Receive WeChat messages (XML format)

To configure WeChat:
1. Set the server URL in your WeChat public account settings: `https://your-domain.com/api/chat/wx`
2. Use the token from your `.env` file
3. WeChat will verify the server automatically

### Chatbot API

- **POST `/api/chat/chatbot/ask`** - Send a question and get an answer
  ```json
  {
    "question": "What is artificial intelligence?",
    "userId": "user123"
  }
  ```

- **GET `/api/chat/chatbot/history/:userId`** - Get conversation history for a user

### Health Check

- **GET `/api/chat/health`** - Production-ready health check with detailed status
- **GET `/health`** - Simple health check (legacy compatibility)

### Example Requests

```bash
# Health check
curl http://localhost:3000/api/chat/health

# Chatbot question
curl -X POST http://localhost:3000/api/chat/chatbot/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "Hello", "userId": "test123"}'

# WeChat message (XML)
curl -X POST http://localhost:3000/api/chat/wx \
  -H "Content-Type: application/xml" \
  -d '<xml><ToUserName><![CDATA[toUser]]></ToUserName>...</xml>'
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment (development/production) | development |
| `OPENAI_BASE_URL` | OpenAI/API2D API endpoint | https://openai.api2d.net |
| `OPENAI_API_KEY` | Your OpenAI/API2D API key | (required) |
| `GPT_MODEL` | GPT model to use | gpt-3.5-turbo |
| `GPT_MAX_TOKENS` | Maximum tokens in response | 1000 |
| `GPT_TEMPERATURE` | Response creativity (0-1) | 0.7 |
| `WECHAT_TOKEN` | WeChat verification token | (optional, required for WeChat) |
| `WECHAT_APPID` | WeChat App ID | (optional) |
| `WECHAT_APPSECRET` | WeChat App Secret | (optional) |
| `WECHAT_ENCODING_AES_KEY` | WeChat encoding AES key | (optional) |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | * |

## Project Structure

```
yoda-chat/
├── src/
│   ├── index.ts                    # Main server entry point
│   ├── types/
│   │   ├── wechat.ts               # WeChat type definitions
│   │   ├── chatcompletion.ts      # Chat completion type definitions
│   │   └── chatbot.ts              # Chatbot type definitions
│   ├── controllers/
│   │   ├── wechatController.ts     # WeChat message handling
│   │   └── chatbotController.ts    # Chatbot API endpoints
│   ├── services/
│   │   ├── chatbotAgent.ts         # Chatbot logic and conversation management
│   │   ├── llmService.ts           # LLM/OpenAI API integration
│   │   └── chatService.ts          # Chat service wrapper
│   ├── routes/
│   │   ├── wechat.ts               # WeChat routes
│   │   └── chatbot.ts              # Chatbot routes
│   ├── middleware/
│   │   ├── security.ts             # Security headers, CORS, rate limiting
│   │   └── errorHandler.ts         # Centralized error handling
│   └── config/
│       └── env.ts                  # Environment configuration
├── dist/                            # Compiled JavaScript output
├── .github/workflows/
│   └── ci-cd.yml                   # CI/CD pipeline
├── .env.example                     # Environment variables template
├── .dockerignore
├── .gitignore
├── Dockerfile                       # Docker multi-stage build
├── docker-compose.yml               # Docker Compose configuration
├── tsconfig.json                    # TypeScript configuration
├── API_DOCUMENTATION.md             # Complete API documentation
├── PRODUCTION_READINESS.md          # Production readiness checklist
├── ECS_SETUP.md                     # ECS deployment guide
└── README.md
```

## How It Works

1. **WeChat Integration**: 
   - Receives XML messages from WeChat users
   - Verifies message authenticity using SHA1 signature
   - Processes text messages through the chatbot agent
   - Returns formatted XML responses

2. **Chatbot Agent**:
   - Processes user questions through LLM service
   - Currently stores conversation history in-memory
   - Ready for Redis/Database integration

3. **LLM/OpenAI Integration**:
   - Connects to GPT models via API2D/OpenAI API
   - Handles API errors and rate limiting
   - Configurable model and parameters
   - Supports streaming (future enhancement)

4. **Security & Reliability**:
   - Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
   - CORS configuration
   - Rate limiting (100 requests/minute per IP)
   - Centralized error handling
   - Graceful shutdown on SIGTERM/SIGINT
   - Input validation and sanitization

## Production Features

✅ **Security**: Security headers, CORS, rate limiting  
✅ **Error Handling**: Centralized error middleware with standardized responses  
✅ **Reliability**: Graceful shutdown, uncaught error handling  
✅ **Monitoring**: Production-ready health checks  
✅ **Docker**: Multi-stage builds, optimized images  
✅ **CI/CD**: GitHub Actions pipeline for automated deployment  

## Docker Deployment

### Quick Start

```bash
# Build and start
docker compose up -d --build

# View logs
docker compose logs -f yoda-chat

# Stop
docker compose down
```

### Health Check

```bash
# Check container health
docker compose ps

# Test health endpoint
docker exec yoda-chat wget -q -O- http://localhost:3000/api/chat/health
```

See `DOCKER_DEPLOYMENT.md` for detailed deployment guide.

## CI/CD

GitHub Actions automatically:
- Builds TypeScript code
- Creates Docker image
- Pushes to Aliyun ACR
- Deploys to ECS

See `.github/workflows/ci-cd.yml` for details.

## Development Notes

- **Conversation History**: Currently in-memory (will be lost on restart)
  - Consider Redis or Database for production persistence
- **WeChat Format**: Uses XML format (automatically parsed)
- **Error Handling**: Centralized with fallback responses
- **Rate Limiting**: Basic in-memory (consider Redis for distributed systems)

## Troubleshooting

1. **WeChat verification fails**: 
   - Check that `WECHAT_TOKEN` matches your WeChat account settings
   - Verify callback URL is set correctly: `https://your-domain.com/api/chat/wx`

2. **OpenAI/API2D errors**: 
   - Verify your `OPENAI_API_KEY` is correct and has sufficient credits
   - Check `OPENAI_BASE_URL` is correctly configured
   - Review API logs for detailed error messages

3. **Port already in use**: 
   - Change `PORT` in `.env` to a different port
   - Or stop the process using port 3000

4. **Rate limit errors**: 
   - Check rate limiting configuration in `src/middleware/security.ts`
   - Consider Redis-based rate limiting for multiple instances

5. **Docker issues**: 
   - Ensure `taklip-shared-network` exists: `docker network create taklip-shared-network`
   - Check `.env` file is properly configured
   - Review container logs: `docker compose logs yoda-chat`

## API Documentation

For complete API documentation, see:
- **API_DOCUMENTATION.md** - Full API reference with examples
- **PRODUCTION_READINESS.md** - Production readiness checklist

## Production Deployment

### On ECS

1. Set up `.env` file with production values (see `ECS_SETUP.md`)
2. Deploy via CI/CD pipeline or manually:
   ```bash
   docker compose up -d --build
   ```
3. Configure nginx to route `/api/chat/*` to this service

### Environment Setup

See `ECS_SETUP.md` for detailed environment variable configuration.

## License

ISC

