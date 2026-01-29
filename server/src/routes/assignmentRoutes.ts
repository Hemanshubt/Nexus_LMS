import express from 'express';
import {
    getAssignment,
    manageAssignment,
    submitAssignment,
    getSubmissions,
    gradeSubmission
} from '../controllers/assignmentController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

// Student/Public-ish
router.get('/lesson/:lessonId', getAssignment); // Get assignment for a lesson
router.post('/:assignmentId/submit', submitAssignment);

// Instructor only
router.put('/lesson/:lessonId', restrictTo('INSTRUCTOR', 'ADMIN'), manageAssignment); // Create/Update
router.get('/:assignmentId/submissions', restrictTo('INSTRUCTOR', 'ADMIN'), getSubmissions);
router.patch('/submissions/:submissionId', restrictTo('INSTRUCTOR', 'ADMIN'), gradeSubmission);

export default router;
