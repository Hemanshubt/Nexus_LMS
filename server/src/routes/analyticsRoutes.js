"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const analyticsController_1 = require("../controllers/analyticsController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
router.use((0, authMiddleware_1.restrictTo)('INSTRUCTOR', 'ADMIN'));
router.get('/', analyticsController_1.getInstructorAnalytics);
exports.default = router;
