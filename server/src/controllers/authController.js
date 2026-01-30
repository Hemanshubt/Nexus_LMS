"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.register = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = require("../utils/appError");
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
const prisma = new client_1.PrismaClient();
const signToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d', // Simpler for now
    });
};
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id);
    const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    };
    res.cookie('jwt', token, cookieOptions);
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};
exports.register = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { name, email, password, role } = req.body;
    if (!email || !password || !name) {
        return next(new appError_1.AppError('Please provide all details', 400));
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return next(new appError_1.AppError('Email already in use', 400));
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 12);
    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: role || 'STUDENT',
        },
    });
    try {
        await (0, sendEmail_1.default)({
            email: newUser.email,
            subject: 'Welcome to Nexus LMS!',
            message: `Hi ${newUser.name}, Welcome to Nexus LMS! We are excited to have you on board.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Welcome to Nexus LMS!</h2>
                    <p>Hi ${newUser.name},</p>
                    <p>We are excited to have you on board.</p>
                    <p>Explore our courses and start learning today.</p>
                    <a href="${process.env.ZF_URL || 'http://localhost:5173'}/courses" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Browse Courses</a>
                </div>
            `
        });
    }
    catch (err) {
        console.error('Welcome email failed', err);
    }
    createSendToken(newUser, 201, res);
});
exports.login = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new appError_1.AppError('Please provide email and password', 400));
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
        return next(new appError_1.AppError('Incorrect email or password', 401));
    }
    createSendToken(user, 200, res);
});
const logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: 'success' });
};
exports.logout = logout;
