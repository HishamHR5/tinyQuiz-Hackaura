# 🎯 TinyQuiz - AI-Powered Quiz Platform

TinyQuiz is a full-stack application that allows users to generate quizzes on any topic using AI, manage them, and have students take them. It's a complete solution for educators, trainers, and anyone looking to create engaging assessments quickly.

This project is composed of two main parts:

*   **`TinyQuiz-Backend`**: A Node.js and Express.js application that provides a RESTful API for quiz generation, user authentication, and data management.
*   **`TinyQuiz-Frontend`**: An Angular application that provides a user-friendly interface for interacting with the backend API.

## ✨ Features

### Backend

*   **🤖 AI-Powered Question Generation**: Generate high-quality quiz questions using Google Gemini.
*   **⚡ Instant Quiz Creation**: Create quizzes in seconds, not hours.
*   **🔐 Secure Authentication**: JWT-based user authentication with bcrypt password hashing.
*   **📊 Real-time Analytics**: Track quiz performance and student responses.
*   **⏰ Time-Limited Quizzes**: Auto-expiring quizzes (30 minutes) for security.
*   **🌐 RESTful API**: Clean, well-documented API endpoints.
*   **🎯 Anonymous Quiz Taking**: Students don't need accounts to take quizzes.
*   **📈 Detailed Results**: Comprehensive analytics and question-level insights.

### Frontend

*   **Modern UI**: A clean and intuitive user interface built with Angular.
*   **Component-Based Architecture**: A modular and maintainable codebase.
*   **Routing**: A well-defined routing structure for easy navigation.
*   **Services**: Separation of concerns with services for API communication.
*   **Guards**: Route protection for authenticated users.
*   **Interceptors**: Centralized handling of HTTP requests and responses.

## 🛠️ Tech Stack

### Backend

*   **Runtime**: Node.js 16+
*   **Framework**: Express.js
*   **Database**: MongoDB (+ Mongoose ODM)
*   **Authentication**: JWT + bcrypt
*   **AI Integration**: Google Gemini Pro

### Frontend

*   **Framework**: Angular
*   **Styling**: SCSS
*   **Testing**: Karma, Jasmine

## 📂 Project Structure

```
unit6-tech/
├── TinyQuiz-Backend/     # Node.js/Express.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── ...
├── TinyQuiz-Frontend/    # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── ...
│   └── ...
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites

*   **Node.js**: Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
*   **Angular CLI**: Install the Angular CLI globally: `npm install -g @angular/cli`
*   **MongoDB**: You need a running instance of MongoDB. You can use a local installation or a cloud service like MongoDB Atlas.
*   **Google Gemini API Key**: Get your free Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

### 1. Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd TinyQuiz-Backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    ```bash
    npm run setup
    ```
    This will create a `.env` file. You will need to add your `MONGO_URI` and `GEMINI_API_KEY`.

4.  **Start the backend server:**
    ```bash
    npm run dev
    ```
    The backend server will be running on `http://localhost:5000`.

### 2. Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../TinyQuiz-Frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the frontend development server:**
    ```bash
    ng serve
    ```
    The frontend application will be running on `http://localhost:4200/`.

## 📚 API Endpoints

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | System health check | ❌ |
| `GET` | `/api/docs` | API documentation | ❌ |
| `POST` | `/api/auth/register` | User registration | ❌ |
| `POST` | `/api/auth/login` | User login | ❌ |
| `POST` | `/api/quiz/generate` | Generate AI quiz | ✅ |
| `GET` | `/api/quiz/:id` | Get quiz questions | ❌ |
| `POST` | `/api/quiz/:id/submit`| Submit quiz answers | ❌ |
| `GET` | `/api/quiz/:id/results`| View quiz results | ✅ |

## 🚀 Deployment

You can deploy the backend and frontend separately. The backend README has instructions for deploying to services like Railway, Heroku, and Vercel. The frontend can be built and deployed as a static site or using a service like Firebase Hosting or Vercel.

## 🤝 Contributing

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.
