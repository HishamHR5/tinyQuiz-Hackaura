const Quiz = require('../models/quiz');
const { generateQuestions, getAvailableProviders, PROVIDERS } = require('../utils/aiProviders');

exports.generateQuiz = async (req, res) => {
  try {
    const { topic, questionCount, provider, difficulty, timePerQuestion } = req.body;
    
    // Validate required fields
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Topic is required and must be a non-empty string' });
    }

    // Validate question count if provided
    const numQuestions = questionCount || 5;
    if (numQuestions < 1 || numQuestions > 20) {
      return res.status(400).json({ error: 'Question count must be between 1 and 20' });
    }

    // Validate and set AI provider
    const selectedProvider = provider || PROVIDERS.GEMINI;
    const availableProviders = getAvailableProviders();
    const providerInfo = availableProviders.providers.find(p => p.id === selectedProvider);
    
    if (!providerInfo) {
      return res.status(400).json({ 
        error: `Invalid AI provider. Available providers: ${availableProviders.providers.map(p => p.id).join(', ')}` 
      });
    }

    if (!providerInfo.available) {
      return res.status(500).json({ 
        error: `${providerInfo.name} is not available. Please check ${providerInfo.requiresApiKey} environment variable.` 
      });
    }

    // Validate difficulty
    const validDifficulties = ['easy', 'medium', 'hard'];
    const selectedDifficulty = difficulty && validDifficulties.includes(difficulty) ? difficulty : 'easy';

    // Validate time per question
    const validTimeOptions = [15, 30, 45, 60, 90, 120];
    const selectedTimePerQuestion = timePerQuestion && validTimeOptions.includes(timePerQuestion) ? timePerQuestion : 30;



    // Generate questions using selected AI provider
    const questions = await generateQuestions(topic, numQuestions, selectedProvider, selectedDifficulty);
    
    // Create quiz in database
    const quiz = await Quiz.create({
      creator: req.user,
      topic: topic.trim(),
      questions,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      questionCount: questions.length,
      aiProvider: selectedProvider,
      difficulty: selectedDifficulty,
      timePerQuestion: selectedTimePerQuestion
    });



    // Generate shareable URLs
    const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
    const shareableUrl = `${baseUrl}/quiz/${quiz._id}`;
    const apiUrl = `${req.protocol}://${req.get('host')}/api/quiz/${quiz._id}`;

    res.status(201).json({ 
      id: quiz._id,
      topic: quiz.topic,
      questionCount: quiz.questions.length,
      aiProvider: selectedProvider,
      aiProviderName: providerInfo.name,
      expiresAt: quiz.expiresAt,
      message: `Quiz generated successfully using ${providerInfo.name}`,
      sharing: {
        quizUrl: shareableUrl,        // For frontend sharing
        apiUrl: apiUrl,               // Direct API access
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareableUrl)}`,
        instructions: 'Share this link with students to take the quiz',
        expiresIn: '30 minutes'
      }
    });

  } catch (error) {
    
    // Handle specific error types
    if (error.message.includes('API_KEY')) {
      return res.status(500).json({ error: 'AI service configuration error. Please check your API keys.' });
    }
    
    if (error.message.includes('API error')) {
      return res.status(502).json({ error: 'AI service temporarily unavailable. Please try again later.' });
    }
    
    if (error.message.includes('timed out')) {
      return res.status(504).json({ error: 'Quiz generation timed out. Please try again with a simpler topic.' });
    }
    
    // Generic error for anything else
    res.status(500).json({ error: 'Failed to generate quiz. Please try again.' });
  }
};

exports.getQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate quiz ID format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid quiz ID format' });
    }

    // Find quiz by ID
    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Check if quiz has expired
    if (new Date() > quiz.expiresAt) {
      return res.status(410).json({ error: 'Quiz has expired' });
    }

    // Use the model's public view method
    res.json(quiz.getPublicView());

  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve quiz' });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, answers } = req.body;
    
    // Validate quiz ID format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid quiz ID format' });
    }

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required and must be a non-empty string' });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers must be provided as an array' });
    }

    // Find quiz
    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Check if quiz has expired
    if (new Date() > quiz.expiresAt) {
      return res.status(410).json({ error: 'Quiz has expired and no longer accepts submissions' });
    }

    // Validate answers count matches questions count
    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({ 
        error: `Expected ${quiz.questions.length} answers, received ${answers.length}` 
      });
    }

    // Calculate score using model method
    const { score, results: detailedResults } = quiz.calculateScore(answers);

    // Save response to database
    const response = {
      name: name.trim(),
      answers,
      score,
      submittedAt: new Date()
    };

    quiz.responses.push(response);
    await quiz.save();



    res.json({
      success: true,
      score,
      results: detailedResults,
      message: `Quiz completed! You scored ${score.correct} out of ${score.total} (${score.percentage}%)`
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
};

exports.getResults = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate quiz ID format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid quiz ID format' });
    }

    // Find quiz and populate creator
    const quiz = await Quiz.findById(id).populate('creator', 'email createdAt');
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Check if user is the creator
    if (String(quiz.creator._id) !== req.user) {
      return res.status(403).json({ error: 'Unauthorized - only quiz creator can view results' });
    }

    // Calculate analytics
    const totalResponses = quiz.responses.length;
    const analytics = {
      totalResponses,
      averageScore: totalResponses > 0 
        ? Math.round(quiz.responses.reduce((sum, r) => sum + (r.score?.percentage || 0), 0) / totalResponses)
        : 0
    };

    // Question-level analytics
    const questionAnalytics = quiz.questions.map((question, qIndex) => {
      const responsesForQuestion = quiz.responses.map(r => r.answers[qIndex]);
      const correctCount = responsesForQuestion.filter(answer => answer === question.correctAnswer).length;
      
      // Count answers for each option
      const optionCounts = [0, 1, 2, 3].map(optionIndex => 
        responsesForQuestion.filter(answer => answer === optionIndex).length
      );

      return {
        questionIndex: qIndex,
        question: question.question,
        correctAnswer: question.correctAnswer,
        correctCount,
        correctPercentage: totalResponses > 0 ? Math.round((correctCount / totalResponses) * 100) : 0,
        optionCounts,
        totalResponses: responsesForQuestion.length
      };
    });

    res.json({
      quiz: {
        id: quiz._id,
        topic: quiz.topic,
        creator: quiz.creator.email,
        createdAt: quiz.createdAt,
        expiresAt: quiz.expiresAt,
        questionCount: quiz.questions.length
      },
      analytics,
      questionAnalytics,
      responses: quiz.responses.map(response => ({
        name: response.name,
        score: response.score,
        submittedAt: response.submittedAt,
        answers: response.answers
      }))
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve quiz results' });
  }
};

/**
 * Get sharing information for a quiz
 * Allows quiz creators to get shareable links and QR codes
 */
exports.getQuizSharing = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate quiz ID format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid quiz ID format' });
    }

    // Find quiz and verify ownership
    const quiz = await Quiz.findById(id).populate('creator', 'email');
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Check if user is the creator
    if (String(quiz.creator._id) !== req.user) {
      return res.status(403).json({ error: 'Unauthorized - only quiz creator can access sharing info' });
    }

    // Generate sharing URLs
    const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
    const shareableUrl = `${baseUrl}/quiz/${quiz._id}`;
    const apiUrl = `${req.protocol}://${req.get('host')}/api/quiz/${quiz._id}`;
    
    // Calculate time remaining
    const now = new Date();
    const timeRemaining = Math.max(0, quiz.expiresAt - now);
    const minutesRemaining = Math.floor(timeRemaining / (1000 * 60));
    
    res.json({
      quiz: {
        id: quiz._id,
        topic: quiz.topic,
        questionCount: quiz.questions.length,
        createdAt: quiz.createdAt,
        expiresAt: quiz.expiresAt,
        isExpired: now > quiz.expiresAt,
        minutesRemaining: minutesRemaining
      },
      sharing: {
        // Primary sharing URL (for your frontend)
        quizUrl: shareableUrl,
        
        // Direct API URL (for testing or direct access)
        apiUrl: apiUrl,
        
        // QR Code for easy mobile access
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareableUrl)}`,
        
        // Social sharing URLs
        whatsappShare: `https://wa.me/?text=${encodeURIComponent(`Take this quiz: ${quiz.topic}\n${shareableUrl}`)}`,
        emailShare: `mailto:?subject=${encodeURIComponent(`Quiz: ${quiz.topic}`)}&body=${encodeURIComponent(`You're invited to take a quiz!\n\nTopic: ${quiz.topic}\nQuestions: ${quiz.questions.length}\nTime limit: 30 minutes\n\nClick here to start: ${shareableUrl}`)}`,
        
        // Copy-paste text for easy sharing
        shareText: `🎯 Quiz: ${quiz.topic}\n📝 ${quiz.questions.length} questions\n⏰ ${minutesRemaining} minutes remaining\n\n🔗 Take the quiz: ${shareableUrl}`,
        
        instructions: {
          teachers: 'Share any of these links with your students',
          students: 'Students just need to click the link - no account required',
          mobile: 'Show the QR code for easy mobile access',
          timeLimit: `Quiz expires in ${minutesRemaining} minutes`
        }
      },
      stats: {
        totalResponses: quiz.responses.length,
        lastSubmission: quiz.responses.length > 0 
          ? quiz.responses[quiz.responses.length - 1].submittedAt 
          : null
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve sharing information' });
  }
};

/**
 * Get all quizzes created by the authenticated user
 * Supports filtering by status and pagination
 */
exports.getMyQuizzes = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user;

    // Build query filter
    const filter = { creator: userId };
    
    // Add status filter if provided
    if (status) {
      const now = new Date();
      if (status === 'active') {
        filter.expiresAt = { $gt: now };
      } else if (status === 'expired') {
        filter.expiresAt = { $lte: now };
      }
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const totalQuizzes = await Quiz.countDocuments(filter);

    // Get quizzes with pagination
    const quizzes = await Quiz.find(filter)
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limitNum)
      .select('_id topic questionCount createdAt expiresAt responses');

    // Transform quizzes for response
    const transformedQuizzes = quizzes.map(quiz => {
      const now = new Date();
      const isExpired = now > quiz.expiresAt;
      const timeRemaining = Math.max(0, quiz.expiresAt - now);
      const minutesRemaining = Math.floor(timeRemaining / (1000 * 60));

      return {
        id: quiz._id,
        topic: quiz.topic,
        questionCount: quiz.questionCount,
        createdAt: quiz.createdAt,
        expiresAt: quiz.expiresAt,
        isExpired,
        minutesRemaining: isExpired ? 0 : minutesRemaining,
        responseCount: quiz.responses.length,
        status: isExpired ? 'expired' : 'active'
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalQuizzes / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      quizzes: transformedQuizzes,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalQuizzes,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve your quizzes' });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid quiz ID format' });
    }

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (String(quiz.creator) !== req.user) {
      return res.status(403).json({ error: 'Unauthorized: Only the quiz creator can delete this quiz' });
    }

    await quiz.deleteOne();

    res.json({ success: true, message: 'Quiz successfully deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
};

/**
 * Cleanup expired quizzes for the authenticated user
 */
exports.cleanupExpiredQuizzes = async (req, res) => {
  try {
    const userId = req.user;
    
    // Find and delete expired quizzes for this user
    const result = await Quiz.deleteMany({ 
      creator: userId,
      expiresAt: { $lt: new Date() } 
    });



    res.json({ 
      success: true, 
      deletedCount: result.deletedCount,
      message: `${result.deletedCount} expired quiz(es) have been removed` 
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to cleanup expired quizzes' });
  }
};