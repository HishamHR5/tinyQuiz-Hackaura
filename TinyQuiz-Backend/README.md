# 🎯 TinyQuiz Backend

**AI-powered quiz generation and management platform using Google Gemini**

Generate educational quizzes instantly on any topic using artificial intelligence. Perfect for teachers, trainers, and educators who want to create engaging assessments quickly.

## ✨ Features

- **🤖 AI-Powered Question Generation** - Generate high-quality quiz questions using Google Gemini
- **⚡ Instant Quiz Creation** - Create quizzes in seconds, not hours
- **🔐 Secure Authentication** - JWT-based user authentication with bcrypt password hashing
- **📊 Real-time Analytics** - Track quiz performance and student responses
- **⏰ Time-Limited Quizzes** - Auto-expiring quizzes (30 minutes) for security
- **🌐 RESTful API** - Clean, well-documented API endpoints
- **🎯 Anonymous Quiz Taking** - Students don't need accounts to take quizzes
- **📈 Detailed Results** - Comprehensive analytics and question-level insights

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd TinyQuiz-Backend
npm install
```

### 2. Environment Setup
```bash
npm run setup
```
This creates a `.env` file with auto-generated JWT secret. You just need to add your Gemini API key!

### 3. Get API Key
- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create your free Gemini API key
- Add it to your `.env` file

### 4. Start Server
```bash
npm run dev
```

### 5. Test Everything
```bash
npm test
```

## 📚 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/health` | System health check | ❌ |
| `GET` | `/api/docs` | API documentation | ❌ |
| `POST` | `/api/auth/register` | User registration | ❌ |
| `POST` | `/api/auth/login` | User login | ❌ |
| `POST` | `/api/quiz/generate` | Generate AI quiz | ✅ |
| `GET` | `/api/quiz/:id` | Get quiz questions | ❌ |
| `POST` | `/api/quiz/:id/submit` | Submit quiz answers | ❌ |
| `GET` | `/api/quiz/:id/results` | View quiz results | ✅ |

## 🎯 Usage Examples

### Generate a Quiz
```javascript
// POST /api/quiz/generate
{
  "topic": "JavaScript Programming",
  "questionCount": 5
}
```

### Take a Quiz
```javascript
// GET /api/quiz/507f1f77bcf86cd799439011
// Returns questions without answers

// POST /api/quiz/507f1f77bcf86cd799439011/submit
{
  "name": "John Student",
  "answers": [1, 0, 2, 1, 3]  // Option indices (0-3)
}
```

## 🛠️ Tech Stack

- **Runtime:** Node.js 16+
- **Framework:** Express.js
- **Database:** MongoDB (+ Mongoose ODM)
- **Authentication:** JWT + bcrypt
- **AI Integration:** Google Gemini Pro
- **Development:** Nodemon for auto-reload

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with auto-reload |
| `npm start` | Start production server |
| `npm test` | Run comprehensive API tests |
| `npm run setup` | Interactive environment setup |
| `npm run cleanup` | Remove expired quizzes from database |
| `npm run health` | Check server health |
| `npm run docs` | View API documentation |
| `npm run generate-secret` | Generate new JWT secret |

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGO_URI` | ✅ | - | MongoDB connection string |
| `JWT_SECRET` | ✅ | - | JWT signing secret (auto-generated) |
| `GEMINI_API_KEY` | ✅ | - | Google Gemini API key |
| `PORT` | ❌ | 5000 | Server port |
| `NODE_ENV` | ❌ | development | Environment mode |
| `CORS_ORIGINS` | ❌ | * | Allowed CORS origins |

### Database Options

**Local MongoDB:**
```env
MONGO_URI=mongodb://localhost:27017/tinyquiz
```

**MongoDB Atlas (Cloud):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tinyquiz
```

## 🔐 Security Features

- **Password Hashing:** bcrypt with 12 salt rounds
- **JWT Tokens:** Secure token-based authentication
- **Input Validation:** Comprehensive request validation
- **Rate Limiting:** Configurable request limits
- **CORS Protection:** Configurable origin restrictions
- **Error Handling:** Secure error responses (no sensitive data leaks)

## 📊 Data Models

### User
```javascript
{
  email: String (unique, validated),
  password: String (hashed),
  createdAt: Date
}
```

### Quiz
```javascript
{
  creator: ObjectId (User),
  topic: String,
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number (0-3),
    explanation: String
  }],
  expiresAt: Date,
  responses: [{
    name: String,
    answers: [Number],
    score: {
      correct: Number,
      total: Number,
      percentage: Number
    },
    submittedAt: Date
  }]
}
```

## 🚨 Troubleshooting

### Common Issues

**"MongoDB connection failed"**
- Ensure MongoDB is running (local) or connection string is correct (Atlas)
- Check network connectivity for Atlas

**"GEMINI_API_KEY not set"**
- Get your free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Add it to your `.env` file without quotes

**"Port already in use"**
- Change `PORT` in `.env` file
- Or stop the existing process

### Debug Mode
```bash
NODE_ENV=development ENABLE_API_LOGGING=true npm run dev
```

## 🎯 Use Cases

### Education
- **Teachers:** Create instant homework and test questions
- **Online Courses:** Generate assessments for course modules
- **Tutoring:** Quick knowledge checks for students

### Corporate Training
- **HR:** Compliance and policy training verification
- **Sales:** Product knowledge assessments
- **Safety:** Training completion validation

### Events & Workshops
- **Conferences:** Speaker engagement tools
- **Workshops:** Learning verification
- **Webinars:** Audience knowledge checks

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 **Documentation:** See [SETUP.md](SETUP.md) for detailed setup instructions
- 🐛 **Issues:** Report bugs via GitHub Issues
- 💡 **Feature Requests:** Submit via GitHub Issues
- 📧 **Contact:** Open an issue for general questions

## 🚀 Deployment

### Quick Deploy Options

**Railway:**
```bash
railway login
railway new
railway add
railway deploy
```

**Heroku:**
```bash
heroku create your-app-name
git push heroku main
```

**Vercel:**
```bash
vercel --prod
```

Remember to set environment variables in your deployment platform!

---

**🎉 Happy Quiz Creating! Generate unlimited quizzes with the power of AI!**