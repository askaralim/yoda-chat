# Yoda Chat

A production-ready RAG (Retrieval-Augmented Generation) chatbot AI Agent for WeChat integration using GPT via API2D/OpenAI, with vector search capabilities powered by Qdrant.

## 🚀 Features

- 🤖 **RAG-Powered Chatbot**: Retrieval-Augmented Generation with vector similarity search
- 💬 **WeChat Integration**: Public account integration with duplicate message prevention
- 📝 **Conversation History**: Redis-backed persistent conversation tracking
- 🔍 **Vector Search**: Qdrant vector database for semantic similarity search
- 🗄️ **Knowledge Base Management**: CRUD operations for knowledge documents
- 🎯 **Context-Aware Responses**: Multi-turn conversations with conversation history
- 🔒 **Security**: Security headers, CORS, rate limiting, and admin API key protection
- 🛡️ **Production-Ready**: Error handling, graceful shutdown, health checks
- 🐳 **Docker Support**: Multi-stage builds with Docker Compose
- 🔧 **Code Quality**: ESLint and Prettier for consistent code style
- ✅ **Environment Validation**: Zod-based environment variable validation with type safety
- 🏗️ **Clean Architecture**: Repository pattern, service layer separation
- 📊 **Admin Endpoints**: Knowledge base reindexing and management

## 🏗️ Architecture

### RAG Pipeline
```
User Question → Embedding → Vector Search (Qdrant) → Context Retrieval → LLM (GPT) → Response
```

### Technology Stack
- **Backend**: Node.js 18+, TypeScript 5.3+, Express
- **AI/LLM**: OpenAI/API2D (GPT models)
- **Vector Database**: Qdrant (for embeddings and similarity search)
- **Cache/Storage**: Redis (conversation history, message deduplication)
- **Database**: MySQL (metadata, content, brands)
- **Embeddings**: OpenAI text-embedding models

## 📋 Prerequisites

- Node.js 18+ (ES modules support)
- TypeScript 5.3+
- MySQL database
- Redis server
- Qdrant vector database
- API2D/OpenAI account and API key
- WeChat public account (for WeChat integration)

## 🔧 Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

3. **Configure `.env` file** (see [Configuration](#configuration) section below)

4. **Build the project:**
```bash
npm run build
```

5. **Start the server:**
```bash
npm start
```

6. **Development mode (with auto-reload):**
```bash
npm run dev
```

The server will start on port 3000 (or the port specified in `.env`).

## ⚙️ Configuration

### Environment Variable Validation

The project uses **Zod** for environment variable validation:
- ✅ **Early validation** - Fails fast at startup if variables are missing/invalid
- ✅ **Type safety** - Automatic type coercion (strings → numbers/booleans)
- ✅ **Clear errors** - Shows exactly what's wrong with helpful messages
- ✅ **URL validation** - Validates URLs and enums
- ✅ **Range validation** - Validates numeric ranges (e.g., temperature 0-2)

If validation fails, the app will exit with clear error messages showing which variables need to be fixed.

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3000 | No |
| `NODE_ENV` | Environment (development/production) | development | No |
| **OpenAI/API2D** | | | |
| `OPENAI_API_KEY` | Your OpenAI/API2D API key | - | ✅ Yes |
| `OPENAI_BASE_URL` | API base URL | https://openai.api2d.net | No |
| `GPT_MODEL` | GPT model to use | gpt-3.5-turbo | No |
| `GPT_MAX_TOKENS` | Maximum tokens in response | 1000 | No |
| `GPT_TEMPERATURE` | Response creativity (0-1) | 0.7 | No |
| **Embeddings** | | | |
| `EMBEDDING_MODEL` | Embedding model name | text-embedding-ada-002 | ✅ Yes |
| `EMBEDDING_DIMENSIONS` | Embedding dimensions | 1536 | ✅ Yes |
| `EMBEDDING_BATCH_SIZE` | Batch size for embeddings | 100 | No |
| **Vector Database (Qdrant)** | | | |
| `QDRANT_URL` | Qdrant server URL | - | ✅ Yes |
| `QDRANT_API_KEY` | Qdrant API key (if required) | - | No |
| `VECTOR_CHUNK_SIZE` | Text chunk size for vectorization | 500 | No |
| `VECTOR_TOP_K` | Number of top results to retrieve | 3 | No |
| `VECTOR_MIN_SCORE` | Minimum similarity score | 0.75 | No |
| **Database (MySQL)** | | | |
| `MYSQL_HOST` | MySQL host | - | ✅ Yes |
| `MYSQL_USER` | MySQL username | - | ✅ Yes |
| `MYSQL_PASSWORD` | MySQL password | - | ✅ Yes |
| `MYSQL_DATABASE` | MySQL database name | - | ✅ Yes |
| **Redis** | | | |
| `REDIS_HOST` | Redis host | localhost | ✅ Yes |
| `REDIS_PORT` | Redis port | 6379 | ✅ Yes |
| `REDIS_PASSWORD` | Redis password | - | No |
| `CONVERSATION_TTL_SECONDS` | Conversation history TTL | 604800 (7 days) | No |
| **WeChat** | | | |
| `WECHAT_TOKEN` | WeChat verification token | - | ✅ Yes (for WeChat) |
| `WECHAT_APPID` | WeChat App ID | - | No |
| `WECHAT_APPSECRET` | WeChat App Secret | - | No |
| `WECHAT_ENCODING_AES_KEY` | WeChat encoding AES key | - | No |
| **Admin** | | | |
| `ADMIN_API_KEY` | Admin API key for protected endpoints | - | No |
| **Features** | | | |
| `RAG_BOOTSTRAP` | Auto-build knowledge base on startup | false | No |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | * | No |

## 📡 API Endpoints

**Base URL:** `http://localhost:3000`  
**API Prefix:** `/api/chat` (unique namespace to avoid conflicts with yoda-app's `/api/v1/`)

### Health Check

- **GET `/api/chat/health`** - Production-ready health check with detailed status
- **GET `/health`** - Simple health check (legacy compatibility)
- **GET `/`** - Service information and available endpoints

### Chatbot API

- **POST `/api/chat/chatbot/ask`** - Send a question and get an AI-powered answer
  ```json
  {
    "question": "什么是褪黑素？",
    "userId": "user123"
  }
  ```

- **GET `/api/chat/chatbot/history/:userId`** - Get conversation history for a user

### Knowledge Base Management

- **POST `/api/chat/chatbot/knowledge/:id`** - Add a knowledge document
- **POST `/api/chat/chatbot/knowledge/bulk`** - Bulk import knowledge documents
- **GET `/api/chat/chatbot/knowledge/search?q=query`** - Search knowledge base
- **GET `/api/chat/chatbot/knowledge/:id`** - Get a knowledge document
- **PUT `/api/chat/chatbot/knowledge/:id`** - Update a knowledge document
- **DELETE `/api/chat/chatbot/knowledge/:id`** - Delete a knowledge document

### WeChat Integration

- **GET `/api/chat/wx`** - WeChat server verification
  - Query params: `signature`, `timestamp`, `nonce`, `echostr`
  
- **POST `/api/chat/wx`** - Receive WeChat messages (XML format)
  - Automatically handles duplicate messages (prevents retry processing)
  - Supports text messages and events (subscribe, etc.)

**WeChat Configuration:**
1. Set the server URL in your WeChat public account settings: `https://your-domain.com/api/chat/wx`
2. Use the token from your `.env` file (`WECHAT_TOKEN`)
3. WeChat will verify the server automatically

**WeChat Duplicate Prevention:**
- Messages are cached by `MsgId` in Redis (1 hour TTL)
- Retry requests return cached response immediately
- Prevents duplicate processing when WeChat retries (>5 second timeout)

### Admin API

- **POST `/api/chat/admin/reindex`** - Rebuild knowledge base from MySQL
  - Requires `x-api-key` header or `apiKey` query parameter
  - Body: `{ "types": ["content", "brand"] }` (optional, defaults to both)
  - Returns 202 Accepted with ingestion status

## 🛠️ Development

### Available Scripts

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Development mode with auto-reload
npm run dev

# Linting
npm run lint              # Check for linting errors
npm run lint:fix          # Auto-fix linting errors

# Code formatting
npm run format            # Format all TypeScript files
npm run format:check      # Check if files are formatted

# Type checking
npm run type-check        # Check TypeScript types without building
```

### Code Quality

The project uses **ESLint** and **Prettier** for code quality:

- **ESLint**: Catches bugs, enforces best practices, type safety
- **Prettier**: Automatic code formatting for consistency

See [LINTING_SETUP.md](./LINTING_SETUP.md) for detailed setup and usage.

### Project Structure

```
yoda-chat/
├── src/
│   ├── index.ts                    # Main server entry point
│   ├── config/                      # Configuration modules
│   │   ├── db.ts                    # MySQL database config
│   │   ├── embed.ts                 # Embedding client config
│   │   ├── env.ts                   # Environment variables (Zod validated)
│   │   ├── openai.ts                # OpenAI/API2D config
│   │   └── qdrant.ts                # Qdrant vector DB config
│   ├── controllers/                 # Request handlers (HTTP layer)
│   │   ├── chatbotController.ts     # Chatbot API endpoints
│   │   └── wechatController.ts      # WeChat message handling
│   ├── services/                    # Business logic layer
│   │   ├── cacheService.ts          # Redis client and connection
│   │   ├── chatService.ts           # Chatbot agent (conversation management)
│   │   ├── chunkingService.ts       # Text chunking for RAG
│   │   ├── dbService.ts             # Database operations
│   │   ├── embeddingService.ts     # Text embedding generation
│   │   ├── llmService.ts            # LLM/OpenAI API integration
│   │   ├── vectorService.ts         # Qdrant vector operations
│   │   └── wechatService.ts         # WeChat business logic
│   ├── repositories/                # Data access layer
│   │   ├── conversationRepository.ts # Conversation database operations
│   │   └── knowledgeRepository.ts   # Content/brand database operations
│   ├── routes/                      # Express routes
│   │   ├── admin.ts                 # Admin endpoints
│   │   ├── chatbot.ts               # Chatbot routes
│   │   └── wechat.ts                # WeChat routes
│   ├── middleware/                  # Express middleware
│   │   ├── errorHandler.ts          # Centralized error handling
│   │   └── security.ts              # Security headers, CORS, rate limiting
│   ├── domain/                      # Domain types and models
│   │   └── types/                    # TypeScript type definitions
│   │       ├── chatbot.ts
│   │       ├── chatcompletion.ts
│   │       ├── chatConversations.ts
│   │       ├── chunkResult.ts
│   │       ├── dbContent.ts
│   │       ├── knowledge.ts
│   │       ├── qdrant.ts
│   │       └── wechat.ts
│   └── utils/                       # Utility functions
│       ├── chunkText.ts             # Text chunking utilities
│       ├── extract.ts                # HTML/text extraction
│       ├── hash.ts                   # Hashing utilities
│       ├── logger.ts                 # Logging utility
│       ├── promise.ts                # Promise utilities
│       └── similarity.ts             # Similarity calculations
├── dist/                            # Compiled JavaScript output
├── .eslintrc.json                   # ESLint configuration
├── .prettierrc.json                 # Prettier configuration
├── docker-compose.yml               # Docker Compose configuration
├── Dockerfile                       # Docker multi-stage build
├── tsconfig.json                    # TypeScript configuration
├── package.json
└── README.md
```

## 🔄 How It Works

### RAG (Retrieval-Augmented Generation) Flow

1. **User Question** → Received via API or WeChat
2. **Embedding Generation** → Convert question to vector using OpenAI embeddings
3. **Vector Search** → Query Qdrant for similar chunks (top-K results)
4. **Context Retrieval** → Filter by similarity score threshold
5. **LLM Processing** → Send question + context + history to GPT
6. **Response Generation** → GPT generates answer based on retrieved knowledge
7. **History Storage** → Save conversation to Redis for context in future messages

### Conversation Management

- **Redis Storage**: Conversation history stored in Redis lists
- **Context Window**: Last 10 messages used for LLM context
- **TTL**: Conversations expire after 7 days (configurable)
- **Efficient Operations**: Uses Redis LPUSH/LRANGE/LTRIM for O(1) operations

### Knowledge Base

- **Source**: MySQL database (contents and brands)
- **Processing**: HTML extraction → Text chunking → Embedding → Vector storage
- **Chunking**: Optimized for Chinese text (200-500 characters)
- **Indexing**: Automatic on startup (if `RAG_BOOTSTRAP=true`) or via admin API

### WeChat Integration

- **Message Verification**: SHA1 signature verification
- **XML Parsing**: Automatic XML to JSON conversion
- **Duplicate Prevention**: Redis-cached responses by MsgId
- **Event Handling**: Subscribe events, text messages, etc.

## 🐳 Docker Deployment

### Quick Start

```bash
# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f yoda-chat

# Stop services
docker compose down
```

### Docker Compose Services

- **yoda-chat**: Main application container
- **mysql**: MySQL database (if not using external)
- **redis**: Redis cache (if not using external)
- **qdrant**: Qdrant vector database (if not using external)

### Health Check

```bash
# Check container health
docker compose ps

# Test health endpoint
curl http://localhost:3000/api/chat/health
```

See `DOCKER_COMPOSE_TEST.md` for detailed testing guide.

## 🚀 Production Deployment

### Prerequisites

- Docker and Docker Compose installed
- Environment variables configured
- External services (MySQL, Redis, Qdrant) accessible
- Domain and SSL certificate configured

### Deployment Steps

1. **Set up environment variables** (see `ECS_SETUP.md`)
2. **Build and deploy:**
   ```bash
   docker compose up -d --build
   ```
3. **Configure reverse proxy** (nginx) to route `/api/chat/*` to this service
4. **Set up monitoring** and logging
5. **Configure CI/CD** (see `.github/workflows/`)

See `PRODUCTION_READINESS.md` and `ECS_SETUP.md` for detailed guides.

## 📚 Documentation

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference
- **[PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md)** - Production checklist
- **[ECS_SETUP.md](./ECS_SETUP.md)** - ECS deployment guide
- **[RAG_ROADMAP.md](./RAG_ROADMAP.md)** - RAG implementation roadmap
- **[AGENT_STRATEGY.md](./AGENT_STRATEGY.md)** - AI Agent strategy and assessment
- **[CODE_REVIEW.md](./CODE_REVIEW.md)** - Code review and improvements
- **[LINTING_SETUP.md](./LINTING_SETUP.md)** - ESLint and Prettier setup
- **[TEST_WECHAT_API.md](./TEST_WECHAT_API.md)** - WeChat API testing guide

## 🔍 Troubleshooting

### Common Issues

1. **WeChat verification fails**
   - Check that `WECHAT_TOKEN` matches your WeChat account settings
   - Verify callback URL: `https://your-domain.com/api/chat/wx`
   - Check server logs for signature verification errors

2. **OpenAI/API2D errors**
   - Verify `OPENAI_API_KEY` is correct and has sufficient credits
   - Check `OPENAI_BASE_URL` is correctly configured
   - Review API logs for detailed error messages

3. **Vector search returns no results**
   - Ensure knowledge base is indexed (check Qdrant collection)
   - Verify `VECTOR_MIN_SCORE` threshold is not too high
   - Check embedding model matches between indexing and search
   - Run admin reindex: `POST /api/chat/admin/reindex`

4. **Redis connection errors**
   - Verify `REDIS_HOST` and `REDIS_PORT` are correct
   - Check Redis server is running and accessible
   - Verify `REDIS_PASSWORD` if authentication is enabled

5. **Qdrant connection errors**
   - Verify `QDRANT_URL` is correct and accessible
   - Check `QDRANT_API_KEY` if authentication is required
   - Ensure Qdrant collection exists and is initialized

6. **Port already in use**
   - Change `PORT` in `.env` to a different port
   - Or stop the process using port 3000: `lsof -ti:3000 | xargs kill`

7. **Docker issues**
   - Ensure `taklip-shared-network` exists: `docker network create taklip-shared-network`
   - Check `.env` file is properly configured
   - Review container logs: `docker compose logs yoda-chat`

## 🧪 Testing

### Test Scripts

- `test-wechat-api.sh` - Test WeChat API endpoints
- `test-wechat-api-verbose.sh` - Verbose WeChat testing
- `test-wechat-curl.sh` - cURL-based WeChat tests
- `test-wechat.py` - Python-based WeChat tests
- `test-docker-compose.sh` - Docker Compose testing
- `test-full-deploy.sh` - Full deployment testing

See `TEST_WECHAT_API.md` for detailed testing instructions.

## 🔐 Security Features

- ✅ **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.
- ✅ **CORS Configuration**: Configurable allowed origins
- ✅ **Rate Limiting**: 100 requests/minute per IP
- ✅ **Admin API Protection**: API key authentication
- ✅ **Input Validation**: Request validation and sanitization (XSS pattern detection)
- ✅ **Error Handling**: Centralized error handling without information leakage
- ✅ **WeChat Signature Verification**: SHA1 signature validation
- ✅ **Environment Validation**: Zod-based validation ensures all required secrets are set
- ✅ **Parameterized Queries**: SQL injection prevention

## 📈 Performance

- **Vector Search**: Optimized Qdrant queries with similarity thresholds
- **Caching**: Redis caching for conversation history and duplicate prevention
- **Efficient Chunking**: Chinese-optimized text chunking (200-500 chars)
- **Batch Processing**: Configurable embedding batch sizes
- **Connection Pooling**: Database connection management
- **Repository Pattern**: Clean data access layer for better maintainability
- **Service Layer**: Separated business logic for better testability

## 🤝 Contributing

1. Follow the code style (ESLint + Prettier)
2. Run `npm run lint` and `npm run format` before committing
3. Follow the architecture patterns:
   - **Repositories** for database operations
   - **Services** for business logic
   - **Controllers** for HTTP handling
4. Add tests for new features
5. Update documentation as needed

## 🏗️ Architecture Patterns

### Repository Pattern
- Database operations are in `repositories/` directory
- `conversationRepository.ts` - Conversation database operations
- `knowledgeRepository.ts` - Content/brand database operations

### Service Layer
- Business logic is in `services/` directory
- Services handle orchestration and business rules
- Controllers delegate to services

### Domain Types
- Type definitions are in `domain/types/` directory
- Clear separation of domain models from infrastructure

See [CODE_REVIEW.md](./CODE_REVIEW.md) for detailed architecture review and improvement recommendations.

## 📄 License

ISC

---

**Built with ❤️ for intelligent conversations**
