const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  topic: { 
    type: String, 
    required: [true, 'Topic is required'],
    trim: true,
    maxlength: [200, 'Topic cannot exceed 200 characters']
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: [{
      type: String,
      required: true
    }],
    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
      max: 3
    },
    explanation: {
      type: String,
      required: true
    }
  }],
  questionCount: {
    type: Number,
    default: function() {
      return this.questions ? this.questions.length : 0;
    }
  },
  aiProvider: {
    type: String,
    enum: ['gemini', 'nvidia'],
    default: 'gemini',
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  timePerQuestion: {
    type: Number,
    default: 30,
    min: 15,
    max: 120
  },
  expiresAt: { 
    type: Date,
    required: true
  },
  responses: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    answers: [{
      type: Number,
      // Allow -1 to represent unanswered questions from the client
      min: -1,
      max: 3
    }],
    score: {
      correct: Number,
      total: Number,
      percentage: Number
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for performance
quizSchema.index({ creator: 1, createdAt: -1 }); // For user's quiz history
quizSchema.index({ expiresAt: 1 }); // For cleanup operations

// Virtual for checking if quiz is expired
quizSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Virtual for time remaining
quizSchema.virtual('timeRemaining').get(function() {
  return Math.max(0, this.expiresAt - new Date());
});

// Instance method to get quiz for public access (without answers)
quizSchema.methods.getPublicView = function() {
  return {
    id: this._id,
    topic: this.topic,
    questions: this.questions.map(q => ({
      question: q.question,
      options: q.options
    })),
    questionCount: this.questionCount,
    expiresAt: this.expiresAt,
    timeRemaining: this.timeRemaining,
    timePerQuestion: this.timePerQuestion
  };
};

// Instance method to calculate score for a submission
quizSchema.methods.calculateScore = function(answers) {
  if (!Array.isArray(answers) || answers.length !== this.questions.length) {
    throw new Error('Invalid answers array');
  }

  let correctCount = 0;
  const results = this.questions.map((question, index) => {
    const userAnswer = answers[index];
    const isCorrect = userAnswer === question.correctAnswer;
    if (isCorrect) correctCount++;
    
    return {
      questionIndex: index,
      question: question.question,
      userAnswer: userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect: isCorrect,
      explanation: question.explanation
    };
  });

  const score = {
    correct: correctCount,
    total: this.questions.length,
    percentage: Math.round((correctCount / this.questions.length) * 100)
  };

  return { score, results };
};

// Static method to cleanup expired quizzes
quizSchema.statics.cleanupExpired = async function() {
  const result = await this.deleteMany({ expiresAt: { $lt: new Date() } });

  return result;
};

module.exports = mongoose.model('Quiz', quizSchema);
