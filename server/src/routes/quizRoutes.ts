import express from 'express';
import { getQuiz, manageQuiz, submitQuiz } from '../controllers/quizController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/lesson/:lessonId', getQuiz);
router.post('/lesson/:lessonId', restrictTo('INSTRUCTOR', 'ADMIN'), manageQuiz);
router.post('/:quizId/attempt', submitQuiz);

export default router;
