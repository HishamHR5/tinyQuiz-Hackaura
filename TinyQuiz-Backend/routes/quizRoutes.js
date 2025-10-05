const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { generateQuiz, getQuiz, submitQuiz, getResults, getQuizSharing, getMyQuizzes, deleteQuiz, cleanupExpiredQuizzes } = require('../controllers/quizController');

router.post('/generate', auth, generateQuiz);
router.get('/my-quizzes', auth, getMyQuizzes);
router.get('/:id', getQuiz);
router.get('/:id/share', auth, getQuizSharing);
router.post('/:id/submit', submitQuiz);
router.get('/:id/results', auth, getResults);
router.delete('/:id', auth, deleteQuiz);
router.post('/cleanup-expired', auth, cleanupExpiredQuizzes);

module.exports = router;
