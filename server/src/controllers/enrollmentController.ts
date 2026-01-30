import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';
import { PrismaClient, NotificationType } from '@prisma/client';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createNotification } from './notificationController';

const prisma = new PrismaClient();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const getEnrollmentStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId,
                courseId
            }
        }
    });

    res.status(200).json({
        status: 'success',
        data: {
            isEnrolled: !!enrollment,
            enrollment
        }
    });
});

export const createOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { courseId } = req.body;
    const userId = req.user.id;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return next(new AppError('Course not found', 404));

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } }
    });

    if (existingEnrollment) {
        return next(new AppError('You are already enrolled in this course', 400));
    }

    // Handle Free Course
    if (course.price === 0) {
        const enrollment = await prisma.enrollment.create({
            data: {
                userId,
                courseId,
                progress: 0,
                completed: false
            }
        });

        // Send notification for free enrollment
        await createNotification(
            userId,
            NotificationType.ENROLLMENT,
            'Enrollment Successful!',
            `You have successfully enrolled in "${course.title}". Start learning now!`,
            `/student/courses/${courseId}`
        );

        return res.status(200).json({
            status: 'success',
            message: 'Enrolled successfully for free',
            data: { enrollment, isFree: true }
        });
    }

    // Create Razorpay Order
    const options = {
        amount: Math.round(course.price * 100), // Amount in paise
        currency: "INR",
        receipt: `rcpt_${courseId?.slice(0, 10)}_${userId?.slice(0, 10)}`,
    };

    console.log('RAZORPAY OPTIONS:', options);

    try {
        const order = await razorpay.orders.create(options);

        // Optional: Store pending payment record
        await prisma.payment.create({
            data: {
                orderId: order.id,
                amount: course.price,
                userId,
                courseId,
                status: 'PENDING'
            }
        });

        res.status(200).json({
            status: 'success',
            data: {
                order
            }
        });
    } catch (error) {
        console.error('RAZORPAY ERROR:', error);
        return next(new AppError('Failed to create payment order', 500));
    }
});

export const verifyPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {
        courseId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    } = req.body;
    const userId = req.user.id;

    // Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        // Optional: Mark payment as failed if we have the record
        await prisma.payment.updateMany({
            where: { orderId: razorpay_order_id },
            data: { status: 'FAILED' }
        });
        return next(new AppError('Payment verification failed', 400));
    }

    // Atomic transaction: Create Enrollment and Update Payment
    const result = await prisma.$transaction(async (tx) => {
        // 1. Create Enrollment
        const enrollment = await tx.enrollment.create({
            data: {
                userId,
                courseId,
                progress: 0,
                completed: false
            }
        });

        // 2. Update/Create Payment Record
        const payment = await tx.payment.upsert({
            where: { orderId: razorpay_order_id },
            update: {
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
                enrollmentId: enrollment.id,
                status: 'SUCCESS'
            },
            create: {
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
                amount: 0, // Should have been created in createOrder, but fallback
                userId,
                courseId,
                enrollmentId: enrollment.id,
                status: 'SUCCESS'
            }
        });

        return { enrollment, payment };
    });

    // Get course name for notification
    const course = await prisma.course.findUnique({ where: { id: courseId } });

    // Send notification for paid enrollment
    await createNotification(
        userId,
        NotificationType.ENROLLMENT,
        'Enrollment Successful!',
        `Payment confirmed! You are now enrolled in "${course?.title}". Start learning now!`,
        `/student/courses/${courseId}`
    );

    // Send payment notification
    await createNotification(
        userId,
        NotificationType.PAYMENT,
        'Payment Received',
        `Your payment of ₹${result.payment.amount} for "${course?.title}" was successful.`,
        `/student/dashboard`
    );

    res.status(201).json({
        status: 'success',
        data: {
            enrollment: result.enrollment,
            payment: result.payment
        }
    });
});

export const getMyEnrollments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;

    const enrollments = await prisma.enrollment.findMany({
        where: {
            userId
        },
        include: {
            course: {
                select: {
                    id: true,
                    title: true,
                    thumbnail: true,
                    description: true,
                    price: true,
                    instructor: {
                        select: {
                            name: true
                        }
                    },
                    sections: {
                        select: {
                            _count: {
                                select: { lessons: true }
                            }
                        }
                    }
                }
            }
        }
    });

    res.status(200).json({
        status: 'success',
        results: enrollments.length,
        data: {
            enrollments
        }
    });
});
