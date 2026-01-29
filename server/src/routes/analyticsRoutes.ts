import express from 'express';
import { getInstructorAnalytics } from '../controllers/analyticsController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);
router.use(restrictTo('INSTRUCTOR', 'ADMIN'));

router.get('/', getInstructorAnalytics);

export default router;
