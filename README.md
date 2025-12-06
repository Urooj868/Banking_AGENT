<div align="center">
  <h1>🏦 Neobank AI Agent - Vault</h1>
  <p><strong>An AI-powered digital banking assistant with biometric verification and account opening</strong></p>
</div>

## 📋 Features

- 🤖 **AI Banking Assistant** - Vault, powered by Gemma 2 running locally via Llama.cpp
- 🔐 **Biometric Verification** - Facial recognition for secure identity verification
- 📋 **Account Opening** - Automated account creation with form collection
- ✅ **NADRA Integration** - Identity verification against national database
- 💳 **Transaction Processing** - Mock deposit, transfer, and payment transactions
- 🎨 **Modern UI** - React + Tailwind CSS with real-time chat interface

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16+)
- **Llama.cpp Server** running with Gemma model
- **Webcam** (for biometric verification, or use demo mode)

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd neobank-ai-agent
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env  # if .env.example exists
# Or create .env with:
LLAMA_CPP_URL=http://localhost:8080
```

4. Start Llama.cpp server (in another terminal):

```bash
./llama-server -m gemma-2-2b-it-Q4_K_M.gguf --host 0.0.0.0 --port 8080
```

5. Start the development server:

```bash
npm run dev
```

6. Open browser: `http://localhost:3000`

## 🔧 Configuration

### Environment Variables (.env)

```env
# Llama.cpp server URL (default: http://localhost:8000)
LLAMA_CPP_URL=http://localhost:8080
```

### Vite Config

- Development server runs on port 3000
- Proxy to Llama.cpp at `/api/llama`
- Hot module reloading enabled

## 📁 Project Structure

```
├── components/
│   ├── BiometricScanner.tsx      # Facial recognition component
│   ├── Dashboard.tsx              # Account dashboard view
├── services/
│   ├── gemmaService.ts           # Llama.cpp integration with Gemma
│   ├── geminiService.ts          # Legacy Gemini service (not used)
├── App.tsx                        # Main app with chat logic
├── types.ts                       # TypeScript interfaces
├── index.tsx                      # React entry point
└── index.html                     # HTML template
```

## 🎯 How It Works

1. **User initiates account opening** via chat with Vault AI
2. **Biometric verification** - Camera scan for facial recognition
3. **Account details collection** - Form-based data input
4. **NADRA verification** - Identity check against national database
5. **Account creation** - Finalize the banking account
6. **Dashboard access** - View account info and perform transactions

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Build Tool**: Vite 6
- **AI Model**: Gemma 2 (via Llama.cpp)
- **HTTP Client**: Fetch API
- **Charts**: Recharts

## 📚 Documentation

- [Biometric Setup Guide](./BIOMETRIC_SETUP.md) - Camera permission troubleshooting
- [Tool Call Debugging](./TOOL_CALL_DEBUG.md) - AI tool execution guide
- [Tool Call Fix](./TOOL_CALL_FIX.md) - Technical details on prompt engineering

## 🚨 Important Security Notes

- ⚠️ **Never commit `.env` file** - It contains API keys and credentials
- 🔐 **Biometric data** is processed locally only
- 🛡️ **This is a demo app** - Not for production use
- 📦 **Sensitive data** should be handled with proper security protocols

## 🐛 Troubleshooting

### Camera Permission Issues

- See [BIOMETRIC_SETUP.md](./BIOMETRIC_SETUP.md)
- Grant camera permission when prompted
- Use "Demo Mode" to skip camera verification

### Llama.cpp Connection Error

- Verify server is running on correct port
- Check `.env` LLAMA_CPP_URL setting
- Ensure proxy is configured in `vite.config.ts`

### Tool Calling Issues

- See [TOOL_CALL_DEBUG.md](./TOOL_CALL_DEBUG.md)
- Check browser console for `[GemmaService]` logs
- Consider upgrading to larger Gemma model (9B variant)

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

## Contributing

Feel free to fork and submit pull requests for improvements.

## 📄 License

MIT

## 👥 Support

For issues or questions, open a GitHub issue or check the documentation files.

---

**Built with ❤️ using Llama.cpp and Gemma**
