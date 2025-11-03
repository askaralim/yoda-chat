# Yoda Chat

A content-based chatbot AI Agent for WeChat integration using GPT via API2D.

## Features

- 🤖 AI-powered chatbot using GPT models via API2D
- 💬 WeChat public account integration
- 📝 Conversation history tracking
- 🎯 Content-based responses with context awareness
- 🔒 WeChat message verification and security

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
   - `API2D_API_KEY`: Your API2D API key
   - `WECHAT_TOKEN`: Your WeChat verification token
   - `WECHAT_APPID`: Your WeChat AppID (optional, for advanced features)
   - `WECHAT_APPSECRET`: Your WeChat AppSecret (optional, for advanced features)

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

### WeChat Integration

- **GET `/wechat`** - WeChat server verification
- **POST `/wechat`** - Receive WeChat messages

To configure WeChat:
1. Set the server URL in your WeChat public account settings
2. Use the token from your `.env` file
3. WeChat will verify the server automatically

### Chatbot API

- **POST `/chatbot/ask`** - Send a question and get an answer
  ```json
  {
    "question": "What is artificial intelligence?",
    "userId": "user123"
  }
  ```

- **GET `/chatbot/history/:userId`** - Get conversation history for a user

### Health Check

- **GET `/health`** - Check server status

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `API2D_BASE_URL` | API2D API endpoint | https://openai.api2d.net |
| `API2D_API_KEY` | Your API2D API key | (required) |
| `GPT_MODEL` | GPT model to use | gpt-3.5-turbo |
| `MAX_TOKENS` | Maximum tokens in response | 1000 |
| `TEMPERATURE` | Response creativity (0-1) | 0.7 |
| `WECHAT_TOKEN` | WeChat verification token | (required) |

## Project Structure

```
yoda-chat/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── types/
│   │   ├── wechat.ts         # WeChat type definitions
│   │   ├── api2d.ts          # API2D type definitions
│   │   └── chatbot.ts        # Chatbot type definitions
│   ├── controllers/
│   │   ├── wechatController.ts    # WeChat message handling
│   │   └── chatbotController.ts   # Chatbot API endpoints
│   ├── services/
│   │   ├── chatbotAgent.ts        # Chatbot logic and conversation management
│   │   └── api2dService.ts        # API2D API integration
│   └── routes/
│       ├── wechat.ts              # WeChat routes
│       └── chatbot.ts             # Chatbot routes
├── dist/                     # Compiled JavaScript output
├── .env.example              # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json             # TypeScript configuration
└── README.md
```

## How It Works

1. **WeChat Integration**: 
   - Receives messages from WeChat users
   - Verifies message authenticity
   - Processes text messages through the chatbot agent

2. **Chatbot Agent**:
   - Maintains conversation history per user
   - Builds context from recent messages
   - Sends requests to API2D for AI responses

3. **API2D Integration**:
   - Connects to GPT models via API2D proxy
   - Handles API errors and rate limiting
   - Configurable model and parameters

## Development Notes

- Conversation history is stored in-memory (consider Redis or a database for production)
- WeChat message format uses XML (automatically parsed)
- Error handling includes fallback responses for better user experience

## Troubleshooting

1. **WeChat verification fails**: Check that `WECHAT_TOKEN` matches your WeChat account settings
2. **API2D errors**: Verify your `API2D_API_KEY` is correct and has sufficient credits
3. **Port already in use**: Change `PORT` in `.env` to a different port

## License

ISC

