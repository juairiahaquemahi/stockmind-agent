

# Stock AI Agent

A full-stack AI-powered stock analysis and portfolio management system built with **React**, **Express.js**, and **Google Gemini AI**. The agent provides real-time market insights, portfolio recommendations, and automated daily analysis with email notifications.

## 🎯 Features

- **AI-Powered Analysis**: Uses Google Gemini 2.5 Flash to analyze stocks and provide buy/sell/hold recommendations
- **Real-Time Market Data**: Integrates with Finnhub API for live stock prices, fundamentals, and news
- **Interactive Chat Interface**: React-based UI with multi-session support for stock research queries
- **Portfolio Tracking**: Automated daily analysis of configured portfolio tickers (AAPL, NVDA, MSFT, AMZN by default)
- **Email Notifications**: Sends portfolio analysis reports via email
- **Tool-Rich Agent**: Access to stock price quotes, company fundamentals, news, earnings, analyst recommendations, and technical indicators
- **Memory System**: Stores analysis context and previous run data to improve recommendations
- **Scheduled Tasks**: Runs portfolio analysis on a configurable schedule

## 📁 Project Structure

```
stock-ai-agent/
├── backend/                    # Node.js Express server
│   ├── agent/
│   │   ├── engine.js          # Agent loop orchestration
│   │   ├── portfolioAgent.js  # Daily portfolio analysis logic
│   │   ├── tools.js           # Stock data tools (Finnhub integration)
│   │   ├── prompts.js         # AI prompts for agent
│   │   └── portfolioMemory.js # Context memory for analyses
│   ├── routes/
│   │   └── chat.js            # Chat API endpoints
│   ├── services/
│   │   └── mailer.js          # Email notification service
│   ├── index.js               # Express app entry point
│   ├── cli.js                 # Command-line interface
│   ├── scheduler.js           # Cron job scheduling
│   ├── package.json
│   └── portfolioMemory.json   # Persistent memory storage
└── frontend/                   # React + Vite
    ├── src/
    │   ├── components/
    │   │   ├── ChatArea.jsx    # Message display
    │   │   ├── InputBar.jsx    # Message input
    │   │   ├── SideBar.jsx     # Session history
    │   │   ├── TopBar.jsx      # Header
    │   │   └── Message.jsx     # Individual message
    │   ├── App.jsx             # Main app component
    │   └── main.jsx            # Entry point
    ├── package.json
    ├── vite.config.js
    └── public/
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Finnhub API key (free tier available at https://finnhub.io)
- Google AI API key (for Gemini)
- Email credentials (for portfolio notifications)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
FINNHUB_API_KEY=your_finnhub_api_key
GOOGLE_API_KEY=your_google_ai_key
PORT=3000
PORTFOLIO_TICKERS=AAPL,NVDA,MSFT,AMZN
# Email settings (optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

Start the server:
```bash
npm start          # Start Express server
npm run chat       # Interactive CLI chat mode
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev        # Development server on http://localhost:5173
npm run build      # Production build
```

## 📡 API Endpoints

- **POST /api/chat** - Send a message to the AI agent
  ```json
  { "message": "What is the current price of AAPL?" }
  ```

- **POST /api/portfolio/run** - Trigger manual portfolio analysis
  ```json
  {}
  ```

## 🤖 Available Tools

The AI agent can access:

1. **get_stock_price** - Real-time stock quotes (price, open, high, low, change)
2. **get_company_fundamentals** - P/E ratio, earnings, market cap, etc.
3. **get_stock_news** - Latest news and sentiment for tickers
4. **get_earnings_dates** - Next earnings announcement dates
5. **get_analyst_recommendations** - Buy/Hold/Sell consensus
6. **get_technical_indicators** - RSI, MACD, moving averages

## 🔧 Key Technologies

| Component | Tech Stack |
|-----------|-----------|
| **Frontend** | React 18, Vite, CSS |
| **Backend** | Node.js, Express 5 |
| **AI/LLM** | Google Gemini 2.5 Flash, LangChain |
| **External APIs** | Finnhub (market data) |
| **Job Scheduling** | node-cron |
| **Email** | Nodemailer |
| **Validation** | Zod |
| **Deployment** | Netlify |

## 📝 Development

### Running in CLI Mode
```bash
cd backend
npm run chat
```
This starts an interactive chat where you can ask stock questions directly.

### Daily Portfolio Analysis
The agent automatically:
1. Analyzes configured tickers
2. Fetches fresh market data
3. Makes BUY/SELL/HOLD decisions
4. Saves analysis to memory for context
5. Sends email report (if configured)

## 🌐 Deployment

Both frontend and backend are configured for Netlify deployment with netlify.toml configuration files.

---

Built with ❤️ for stock analysis automation using AI reasoning.
