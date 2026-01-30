"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCertificate = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = require("../utils/appError");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get (or create) Certificate
exports.getCertificate = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { courseId } = req.params;
    const userId = req.user.id;
    // 1. Check if certificate already exists
    let certificate = await prisma.certificate.findUnique({
        where: {
            userId_courseId: {
                userId,
                courseId
            }
        },
        include: {
            user: { select: { name: true } },
            course: { select: { title: true, instructor: { select: { name: true } } } }
        }
    });
    if (!certificate) {
        // 2. Check if eligible (Enrollment completed)
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId
                }
            }
        });
        if (!enrollment || !enrollment.completed) {
            return next(new appError_1.AppError('Course not completed yet. Certificate not available.', 400));
        }
        // 3. Create Certificate
        certificate = await prisma.certificate.create({
            data: {
                userId,
                courseId
            },
            include: {
                user: { select: { name: true } },
                course: { select: { title: true, instructor: { select: { name: true } } } }
            }
        });
    }
    res.status(200).json({
        status: 'success',
        data: {
            certificate
        }
    });
});
