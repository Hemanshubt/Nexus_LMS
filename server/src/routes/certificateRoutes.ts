import express from 'express';
import { getCertificate } from '../controllers/certificateController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/:courseId', getCertificate);

export default router;
