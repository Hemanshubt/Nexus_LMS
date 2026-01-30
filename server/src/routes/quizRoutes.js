"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const quizController_1 = require("../controllers/quizController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
router.get('/lesson/:lessonId', quizController_1.getQuiz);
router.post('/lesson/:lessonId', (0, authMiddleware_1.restrictTo)('INSTRUCTOR', 'ADMIN'), quizController_1.manageQuiz);
router.post('/:quizId/attempt', quizController_1.submitQuiz);
exports.default = router;
