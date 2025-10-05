# 🚀 TinyQuiz Backend Setup Guide

## 📋 Prerequisites

Before setting up TinyQuiz Backend, ensure you have:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - Choose one option:
  - **Local MongoDB** - [Install MongoDB Community](https://docs.mongodb.com/manual/installation/)
  - **MongoDB Atlas** (Free) - [Create account](https://www.mongodb.com/atlas)
- **Google Gemini API Key** - [Get your key](https://makersuite.google.com/app/apikey)

## 🛠️ Installation Steps

### 1. Clone & Navigate
```bash
git clone <your-repo-url>
cd TinyQuiz-Backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy the environment template
cp .env.example .env

# Edit the .env file with your actual values
# Use your preferred text editor:
code .env        # VS Code
nano .env        # Terminal editor
notepad .env     # Windows
```

### 4. Configure Environment Variables

Open `.env` and update these **required** variables:

```env
# Database
MONGO_URI=mongodb://localhost:27017/tinyquiz

# JWT Secret (generate a secure random key)
JWT_SECRET=your-super-secret-jwt-key

# Google Gemini API
GEMINI_API_KEY=your-actual-gemini-api-key
```

#### 🔑 Getting Your Gemini API Key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in your `.env` file

#### 🗄️ Database Options:

**Option A: Local MongoDB**
```env
MONGO_URI=mongodb://localhost:27017/tinyquiz
```

**Option B: MongoDB Atlas (Cloud)**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tinyquiz
```

### 5. Generate Secure JWT Secret
```bash
# Run this command to generate a secure random key:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copy the output and use it as your JWT_SECRET
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```
This starts the server with **nodemon** for auto-restart on file changes.

### Production Mode
```bash
npm start
```

### Verify Installation
Once running, you should see:
```
MongoDB connected
Server running on port 5000
```

## 🧪 Testing the API

### Quick Health Check
```bash
curl http://localhost:5000/api/health
```

### Test User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Run Full API Test Suite
```bash
node test-api.js
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Quiz Endpoints
- `POST /api/quiz/generate` - Generate new quiz (🔒 Auth required)
- `GET /api/quiz/:id` - Get quiz questions (Public)
- `POST /api/quiz/:id/submit` - Submit quiz answers (Public)
- `GET /api/quiz/:id/results` - View quiz results (🔒 Creator only)

### System Endpoints
- `GET /api/health` - Health check
- `GET /api/docs` - API documentation

## 🔧 Configuration Options

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGO_URI` | ✅ | - | MongoDB connection string |
| `JWT_SECRET` | ✅ | - | JWT signing secret |
| `GEMINI_API_KEY` | ✅ | - | Google Gemini API key |
| `PORT` | ❌ | 5000 | Server port |
| `NODE_ENV` | ❌ | development | Environment mode |
| `CORS_ORIGINS` | ❌ | * | Allowed CORS origins |
| `ENABLE_RATE_LIMITING` | ❌ | true | Enable rate limiting |
| `RATE_LIMIT_MAX_REQUESTS` | ❌ | 100 | Max requests per 15min |

### Security Settings
```env
# Production recommendations:
NODE_ENV=production
CORS_ORIGINS=https://yourdomain.com
ENABLE_RATE_LIMITING=true
ENABLE_API_LOGGING=false
```

## 🚨 Troubleshooting

### Common Issues

#### "MongoDB connection failed"
- **Check if MongoDB is running**: `mongod --version`
- **Verify connection string**: Ensure MONGO_URI is correct
- **Atlas users**: Check network access and credentials

#### "GEMINI_API_KEY not set"
- **Verify .env file**: Ensure the key is properly set
- **Check API key validity**: Test at Google AI Studio
- **No quotes needed**: `GEMINI_API_KEY=AIza...` (not `"AIza..."`)

#### "Port already in use"
- **Change port**: Update `PORT=5001` in `.env`
- **Kill existing process**: `pkill -f node` or `lsof -ti:5000 | xargs kill`

#### "Invalid JWT Secret"
- **Generate new secret**: Use the crypto command above
- **Check length**: Should be at least 32 characters
- **No special characters**: Use alphanumeric only

### Debug Mode
```bash
# Enable detailed logging
NODE_ENV=development ENABLE_API_LOGGING=true npm run dev
```

### Database Connection Test
```bash
# Test MongoDB connection
node -e "
const mongoose = require('mongoose');
mongoose.connect('your-mongo-uri')
  .then(() => { console.log('✅ MongoDB connected'); process.exit(0); })
  .catch(err => { console.error('❌ MongoDB failed:', err.message); process.exit(1); });
"
```

## 📦 Package Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `nodemon server.js` | Development mode with auto-restart |
| `npm start` | `node server.js` | Production mode |
| `npm test` | `node test-api.js` | Run API tests |
| `npm run cleanup` | `node scripts/cleanup.js` | Clean expired quizzes |

## 🔐 Security Best Practices

### For Production:
1. **Use strong JWT secret** (64+ random characters)
2. **Set specific CORS origins** (not `*`)
3. **Enable rate limiting**
4. **Use HTTPS** (configure reverse proxy)
5. **Set NODE_ENV=production**
6. **Use environment variables** (never hardcode secrets)
7. **Regular security updates**: `npm audit fix`

### Database Security:
- Use MongoDB authentication
- Enable TLS/SSL connections
- Regular backups
- Monitor access logs

## 🆘 Getting Help

- **API Issues**: Check server logs
- **Database Problems**: Verify connection string
- **AI Integration**: Test Gemini API key separately
- **General Support**: Create an issue in the repository

## 🎯 Next Steps

1. **Test all endpoints** using the provided test script
2. **Set up your frontend** to connect to this backend
3. **Configure production environment** with proper security
4. **Set up monitoring** and logging
5. **Deploy to your preferred platform** (Heroku, Railway, etc.)

---

**🎉 You're all set! Your TinyQuiz backend is ready to generate AI-powered quizzes!**