import express from 'express';
import { getMe, updateMe, getAllUsers, getUser, updateUser, deleteUser } from '../controllers/userController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/me', getMe);
router.patch('/me', updateMe);

// Admin only routes
router.use(restrictTo('ADMIN'));

router.route('/')
    .get(getAllUsers);

router.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

export default router;
