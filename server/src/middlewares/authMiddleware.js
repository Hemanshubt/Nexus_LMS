"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.optionalProtect = exports.protect = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = require("../utils/appError");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.protect = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        return next(new appError_1.AppError('You are not logged in! Please log in to get access.', 401));
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    const currentUser = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!currentUser) {
        return next(new appError_1.AppError('The user belonging to this token no longer does exist.', 401));
    }
    req.user = currentUser;
    next();
});
exports.optionalProtect = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        return next();
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const currentUser = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (currentUser) {
            req.user = currentUser;
        }
    }
    catch (err) {
        // Token invalid - ignore
    }
    next();
});
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new appError_1.AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
