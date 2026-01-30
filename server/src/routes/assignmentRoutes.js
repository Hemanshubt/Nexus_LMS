"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const assignmentController_1 = require("../controllers/assignmentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
// Student/Public-ish
router.get('/lesson/:lessonId', assignmentController_1.getAssignment); // Get assignment for a lesson
router.post('/:assignmentId/submit', assignmentController_1.submitAssignment);
// Instructor only
router.put('/lesson/:lessonId', (0, authMiddleware_1.restrictTo)('INSTRUCTOR', 'ADMIN'), assignmentController_1.manageAssignment); // Create/Update
router.get('/:assignmentId/submissions', (0, authMiddleware_1.restrictTo)('INSTRUCTOR', 'ADMIN'), assignmentController_1.getSubmissions);
router.patch('/submissions/:submissionId', (0, authMiddleware_1.restrictTo)('INSTRUCTOR', 'ADMIN'), assignmentController_1.gradeSubmission);
exports.default = router;
