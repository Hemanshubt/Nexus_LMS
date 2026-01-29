import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import 'dotenv-safe/config';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(cors({
    origin: process.env.ZF_URL || 'http://localhost:5173',
    credentials: true,
}));

// Routes
// Routes
import authRouter from './routes/authRoutes';
import courseRouter from './routes/courseRoutes';
import uploadRouter from './routes/uploadRoutes';
import enrollmentRouter from './routes/enrollmentRoutes';
import progressRouter from './routes/progressRoutes';
import userRouter from './routes/userRoutes';
import quizRouter from './routes/quizRoutes';
import certificateRouter from './routes/certificateRoutes';
import analyticsRouter from './routes/analyticsRoutes';
import assignmentRouter from './routes/assignmentRoutes';
import reviewRouter from './routes/reviewRoutes';
import commentRouter from './routes/commentRoutes';

const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/users`, userRouter);
app.use(`${API_PREFIX}/courses`, courseRouter);
app.use(`${API_PREFIX}/upload`, uploadRouter);
app.use(`${API_PREFIX}/enrollments`, enrollmentRouter);
app.use(`${API_PREFIX}/progress`, progressRouter);
app.use(`${API_PREFIX}/quizzes`, quizRouter);
app.use(`${API_PREFIX}/certificates`, certificateRouter);
app.use(`${API_PREFIX}/analytics`, analyticsRouter);
app.use(`${API_PREFIX}/assignments`, assignmentRouter);
app.use(`${API_PREFIX}/reviews`, reviewRouter);
app.use(`${API_PREFIX}/comments`, commentRouter);

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Global Error Handler
import errorHandler from './middlewares/errorHandler';
import { AppError } from './utils/appError';

app.all('*', (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

// Start Server
const server = app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});

export default app;
