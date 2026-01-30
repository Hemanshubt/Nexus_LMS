"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courseController_1 = require("../controllers/courseController");
const sectionController_1 = require("../controllers/sectionController");
const lessonController_1 = require("../controllers/lessonController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Public Routes
router.get('/', authMiddleware_1.optionalProtect, courseController_1.getAllCourses);
router.get('/teaching', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('INSTRUCTOR', 'ADMIN'), courseController_1.getCoursesTeaching);
router.get('/:id', courseController_1.getCourse);
// Protected Routes
router.use(authMiddleware_1.protect);
// Course Operations
router.post('/', (0, authMiddleware_1.restrictTo)('INSTRUCTOR', 'ADMIN'), courseController_1.createCourse);
router.patch('/:id', (0, authMiddleware_1.restrictTo)('INSTRUCTOR', 'ADMIN'), courseController_1.updateCourse);
// Section Operations
router.post('/:courseId/sections', (0, authMiddleware_1.restrictTo)('INSTRUCTOR', 'ADMIN'), sectionController_1.createSection);
router.patch('/sections/:id', (0, authMiddleware_1.restrictTo)('INSTRUCTOR', 'ADMIN'), sectionController_1.updateSection);
router.delete('/sections/:id', (0, authMiddleware_1.restrictTo)('INSTRUCTOR', 'ADMIN'), sectionController_1.deleteSection);
// Lesson Operations
router.post('/lessons', (0, authMiddleware_1.restrictTo)('INSTRUCTOR', 'ADMIN'), lessonController_1.createLesson);
router.patch('/lessons/:id', (0, authMiddleware_1.restrictTo)('INSTRUCTOR', 'ADMIN'), lessonController_1.updateLesson);
router.delete('/lessons/:id', (0, authMiddleware_1.restrictTo)('INSTRUCTOR', 'ADMIN'), lessonController_1.deleteLesson);
exports.default = router;
