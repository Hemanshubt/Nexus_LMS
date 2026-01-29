import express from 'express';
import { getUploadSignature, getImageUploadSignature } from '../controllers/uploadController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect); // All upload routes require login

// Video signature (Instructors + Admin only)
router.get('/signature', restrictTo('INSTRUCTOR', 'ADMIN'), getUploadSignature);

// Image signature (Authenticated users)
router.get('/image-signature', getImageUploadSignature);

export default router;
