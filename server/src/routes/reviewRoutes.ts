import express from 'express';
import * as reviewController from '../controllers/reviewController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.get('/course/:courseId', reviewController.getCourseReviews);

// Protected routes
router.use(protect);

router.post('/course/:courseId', reviewController.createReview);
router.delete('/:id', reviewController.deleteReview);

export default router;
