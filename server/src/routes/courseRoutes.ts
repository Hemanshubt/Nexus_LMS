import express from 'express';
import { createCourse, getAllCourses, getCourse, updateCourse, getCoursesTeaching } from '../controllers/courseController';
import { createSection, updateSection, deleteSection } from '../controllers/sectionController';
import { createLesson, updateLesson, deleteLesson } from '../controllers/lessonController';
import { protect, restrictTo, optionalProtect } from '../middlewares/authMiddleware';

const router = express.Router();

// Public Routes
router.get('/', optionalProtect, getAllCourses);
router.get('/teaching', protect, restrictTo('INSTRUCTOR', 'ADMIN'), getCoursesTeaching);
router.get('/:id', getCourse);

// Protected Routes
router.use(protect);

// Course Operations
router.post('/', restrictTo('INSTRUCTOR', 'ADMIN'), createCourse);
router.patch('/:id', restrictTo('INSTRUCTOR', 'ADMIN'), updateCourse);

// Section Operations
router.post('/:courseId/sections', restrictTo('INSTRUCTOR', 'ADMIN'), createSection);
router.patch('/sections/:id', restrictTo('INSTRUCTOR', 'ADMIN'), updateSection);
router.delete('/sections/:id', restrictTo('INSTRUCTOR', 'ADMIN'), deleteSection);

// Lesson Operations
router.post('/lessons', restrictTo('INSTRUCTOR', 'ADMIN'), createLesson);
router.patch('/lessons/:id', restrictTo('INSTRUCTOR', 'ADMIN'), updateLesson);
router.delete('/lessons/:id', restrictTo('INSTRUCTOR', 'ADMIN'), deleteLesson);

export default router;
