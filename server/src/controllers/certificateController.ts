import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get (or create) Certificate
export const getCertificate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
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
            return next(new AppError('Course not completed yet. Certificate not available.', 400));
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
