import express from 'express';
import { createComment, getLessonComments, deleteComment } from '../controllers/commentController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

router.post('/', createComment);
router.get('/lesson/:lessonId', getLessonComments);
router.delete('/:id', deleteComment);

export default router;
