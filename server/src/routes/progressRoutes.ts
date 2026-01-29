import express from 'express';
import { getCourseProgress, updateLessonProgress } from '../controllers/progressController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/:courseId', getCourseProgress);
router.post('/lessons/:lessonId', updateLessonProgress);

export default router;
