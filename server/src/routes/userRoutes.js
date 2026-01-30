"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
router.get('/me', userController_1.getMe);
router.patch('/me', userController_1.updateMe);
// Admin only routes
router.use((0, authMiddleware_1.restrictTo)('ADMIN'));
router.route('/')
    .get(userController_1.getAllUsers);
router.route('/:id')
    .get(userController_1.getUser)
    .patch(userController_1.updateUser)
    .delete(userController_1.deleteUser);
exports.default = router;
