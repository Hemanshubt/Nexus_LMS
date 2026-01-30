"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const enrollmentController_1 = require("../controllers/enrollmentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
router.get('/status/:courseId', enrollmentController_1.getEnrollmentStatus);
router.post('/checkout', enrollmentController_1.createOrder);
router.post('/verify', enrollmentController_1.verifyPayment);
router.get('/my', enrollmentController_1.getMyEnrollments);
exports.default = router;
