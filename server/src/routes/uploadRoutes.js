"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uploadController_1 = require("../controllers/uploadController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect); // All upload routes require login
// Video signature (Instructors + Admin only)
router.get('/signature', (0, authMiddleware_1.restrictTo)('INSTRUCTOR', 'ADMIN'), uploadController_1.getUploadSignature);
// Image signature (Authenticated users)
router.get('/image-signature', uploadController_1.getImageUploadSignature);
exports.default = router;
