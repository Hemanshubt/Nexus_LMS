import express from 'express';
import { getEnrollmentStatus, createOrder, verifyPayment, getMyEnrollments } from '../controllers/enrollmentController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/status/:courseId', getEnrollmentStatus);
router.post('/checkout', createOrder);
router.post('/verify', verifyPayment);
router.get('/my', getMyEnrollments);

export default router;
