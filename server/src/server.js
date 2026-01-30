"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
require("dotenv-safe/config");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.ZF_URL || 'http://localhost:5173',
    credentials: true,
}));
// Routes
// Routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const courseRoutes_1 = __importDefault(require("./routes/courseRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const enrollmentRoutes_1 = __importDefault(require("./routes/enrollmentRoutes"));
const progressRoutes_1 = __importDefault(require("./routes/progressRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const quizRoutes_1 = __importDefault(require("./routes/quizRoutes"));
const certificateRoutes_1 = __importDefault(require("./routes/certificateRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const assignmentRoutes_1 = __importDefault(require("./routes/assignmentRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const wishlistRoutes_1 = __importDefault(require("./routes/wishlistRoutes"));
const couponRoutes_1 = __importDefault(require("./routes/couponRoutes"));
const API_PREFIX = '/api/v1';
app.use(`${API_PREFIX}/auth`, authRoutes_1.default);
app.use(`${API_PREFIX}/users`, userRoutes_1.default);
app.use(`${API_PREFIX}/courses`, courseRoutes_1.default);
app.use(`${API_PREFIX}/upload`, uploadRoutes_1.default);
app.use(`${API_PREFIX}/enrollments`, enrollmentRoutes_1.default);
app.use(`${API_PREFIX}/progress`, progressRoutes_1.default);
app.use(`${API_PREFIX}/quizzes`, quizRoutes_1.default);
app.use(`${API_PREFIX}/certificates`, certificateRoutes_1.default);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes_1.default);
app.use(`${API_PREFIX}/assignments`, assignmentRoutes_1.default);
app.use(`${API_PREFIX}/reviews`, reviewRoutes_1.default);
app.use(`${API_PREFIX}/comments`, commentRoutes_1.default);
app.use(`${API_PREFIX}/notifications`, notificationRoutes_1.default);
app.use(`${API_PREFIX}/wishlist`, wishlistRoutes_1.default);
app.use(`${API_PREFIX}/coupons`, couponRoutes_1.default);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Global Error Handler
const errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
const appError_1 = require("./utils/appError");
app.all('*', (req, res, next) => {
    next(new appError_1.AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(errorHandler_1.default);
// Start Server
const server = app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});
exports.default = app;
