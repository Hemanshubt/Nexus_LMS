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
    const { courseId, couponCode } = req.body;
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

    let finalPrice = course.price;
    let couponId = null;
    let discountAmount = 0;

    // Validate Coupon if provided
    if (couponCode) {
        const coupon = await prisma.coupon.findUnique({
            where: { code: couponCode.toUpperCase() },
            include: { courses: { select: { id: true } } }
        });

        if (coupon && coupon.isActive) {
            // Check validity dates
            const now = new Date();
            const isValidDate = (!coupon.validFrom || coupon.validFrom <= now) &&
                (!coupon.validUntil || coupon.validUntil >= now);

            // Check usage limits
            const isUsageValid = !coupon.usageLimit || coupon.usedCount < coupon.usageLimit;

            // Check user limit
            const userUsage = await prisma.couponUsage.count({
                where: { couponId: coupon.id, userId }
            });
            const isUserLimitValid = userUsage < coupon.perUserLimit;

            // Check course restriction
            const isCourseValid = coupon.courses.length === 0 || coupon.courses.some(c => c.id === courseId);

            // Check min purchase
            const isMinPurchaseValid = !coupon.minPurchase || course.price >= coupon.minPurchase;

            if (isValidDate && isUsageValid && isUserLimitValid && isCourseValid && isMinPurchaseValid) {
                // Calculate discount
                if (coupon.discountType === 'PERCENTAGE') {
                    discountAmount = (course.price * coupon.discountValue) / 100;
                    if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
                } else {
                    discountAmount = coupon.discountValue;
                }
                discountAmount = Math.min(discountAmount, course.price);
                finalPrice = Math.max(0, course.price - discountAmount);
                couponId = coupon.id;
            }
        }
    }

    // Handle Free Course (naturally free or via coupon)
    if (finalPrice <= 0) {
        // Transaction to create enrollment and record coupon usage
        const enrollment = await prisma.$transaction(async (tx) => {
            const newEnrollment = await tx.enrollment.create({
                data: {
                    userId,
                    courseId,
                    progress: 0,
                    completed: false
                }
            });

            if (couponId) {
                await tx.couponUsage.create({
                    data: {
                        couponId,
                        userId,
                        discount: discountAmount
                    }
                });
                await tx.coupon.update({
                    where: { id: couponId },
                    data: { usedCount: { increment: 1 } }
                });
            }
            return newEnrollment;
        });

        // Send notification
        await createNotification(
            userId,
            NotificationType.ENROLLMENT,
            'Enrollment Successful!',
            `You have successfully enrolled in "${course.title}". Start learning now!`,
            `/student/courses/${courseId}`
        );

        return res.status(200).json({
            status: 'success',
            message: 'Enrolled successfully',
            data: { enrollment, isFree: true }
        });
    }

    // Create Razorpay Order
    const options = {
        amount: Math.round(finalPrice * 100), // Amount in paise
        currency: "INR",
        receipt: `rcpt_${courseId?.slice(0, 10)}_${userId?.slice(0, 10)}`,
    };

    try {
        const order = await razorpay.orders.create(options);

        // Store pending payment record with coupon info
        await prisma.payment.create({
            data: {
                orderId: order.id,
                amount: finalPrice,
                userId,
                courseId,
                status: 'PENDING',
                couponId // Store the coupon used for this order
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
        await prisma.payment.updateMany({
            where: { orderId: razorpay_order_id },
            data: { status: 'FAILED' }
        });
        return next(new AppError('Payment verification failed', 400));
    }

    // Atomic transaction
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

        // 2. Update Payment
        const payment = await tx.payment.update({
            where: { orderId: razorpay_order_id },
            data: {
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
                enrollmentId: enrollment.id,
                status: 'SUCCESS'
            }
        });

        // 3. Record Coupon Usage if couponId exists on payment
        if (payment.couponId) {
            // Check if usage already recorded (to be safe)
            const existingUsage = await tx.couponUsage.findFirst({
                where: { orderId: razorpay_order_id }
            });

            if (!existingUsage) {
                // Calculate original price roughly (or fetch course) to know discount?
                // Actually payment.amount is the *discounted* price.
                // We need the discount amount. 
                // Let's re-fetch coupon to calculate or just store simplistic info?
                // Ideally payment record should store `discountAmount` too but we didn't add it.
                // We'll just calculate based on current course price (might have changed? Unlikely during transaction).
                // Better: Fetch coupon and recalculate based on course price.

                const course = await tx.course.findUnique({ where: { id: courseId } });
                const coupon = await tx.coupon.findUnique({ where: { id: payment.couponId } });

                if (course && coupon) {
                    let discountAmount = 0;
                    if (coupon.discountType === 'PERCENTAGE') {
                        discountAmount = (course.price * coupon.discountValue) / 100;
                        if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
                    } else {
                        discountAmount = coupon.discountValue;
                    }
                    discountAmount = Math.min(discountAmount, course.price);

                    await tx.couponUsage.create({
                        data: {
                            couponId: payment.couponId!,
                            userId,
                            orderId: razorpay_order_id,
                            discount: discountAmount
                        }
                    });

                    await tx.coupon.update({
                        where: { id: payment.couponId! },
                        data: { usedCount: { increment: 1 } }
                    });
                }
            }
        }

        return { enrollment, payment };
    });

    const course = await prisma.course.findUnique({ where: { id: courseId } });

    await createNotification(
        userId,
        NotificationType.ENROLLMENT,
        'Enrollment Successful!',
        `Payment confirmed! You are now enrolled in "${course?.title}". Start learning now!`,
        `/student/courses/${courseId}`
    );

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
