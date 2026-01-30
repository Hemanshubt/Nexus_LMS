"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyEnrollments = exports.verifyPayment = exports.createOrder = exports.getEnrollmentStatus = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = require("../utils/appError");
const client_1 = require("@prisma/client");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const notificationController_1 = require("./notificationController");
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
const prisma = new client_1.PrismaClient();
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
exports.getEnrollmentStatus = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
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
exports.createOrder = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { courseId, couponCode } = req.body;
    const userId = req.user.id;
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course)
        return next(new appError_1.AppError('Course not found', 404));
    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } }
    });
    if (existingEnrollment) {
        return next(new appError_1.AppError('You are already enrolled in this course', 400));
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
                    if (coupon.maxDiscount)
                        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
                }
                else {
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
        await (0, notificationController_1.createNotification)(userId, client_1.NotificationType.ENROLLMENT, 'Enrollment Successful!', `You have successfully enrolled in "${course.title}". Start learning now!`, `/student/courses/${courseId}`);
        // Send Email
        try {
            await (0, sendEmail_1.default)({
                email: req.user.email,
                subject: 'Enrollment Successful',
                message: `You have successfully enrolled in "${course.title}". Start learning now!`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Enrollment Confirmed!</h2>
                        <p>Hi ${req.user.name},</p>
                        <p>You have successfully enrolled in <strong>${course.title}</strong>.</p>
                        <p>Start learning now by clicking the button below:</p>
                        <a href="${process.env.ZF_URL || 'http://localhost:5173'}/learn/${courseId}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Course</a>
                        <p style="margin-top: 20px; font-size: 12px; color: #666;">Happy Learning,<br>Nexus LMS Team</p>
                    </div>
                `
            });
        }
        catch (err) {
            console.error('Email send failed', err);
        }
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
    }
    catch (error) {
        console.error('RAZORPAY ERROR:', error);
        return next(new appError_1.AppError('Failed to create payment order', 500));
    }
});
exports.verifyPayment = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { courseId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user.id;
    // Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto_1.default
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
    if (expectedSignature !== razorpay_signature) {
        await prisma.payment.updateMany({
            where: { orderId: razorpay_order_id },
            data: { status: 'FAILED' }
        });
        return next(new appError_1.AppError('Payment verification failed', 400));
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
                        if (coupon.maxDiscount)
                            discountAmount = Math.min(discountAmount, coupon.maxDiscount);
                    }
                    else {
                        discountAmount = coupon.discountValue;
                    }
                    discountAmount = Math.min(discountAmount, course.price);
                    await tx.couponUsage.create({
                        data: {
                            couponId: payment.couponId,
                            userId,
                            orderId: razorpay_order_id,
                            discount: discountAmount
                        }
                    });
                    await tx.coupon.update({
                        where: { id: payment.couponId },
                        data: { usedCount: { increment: 1 } }
                    });
                }
            }
        }
        return { enrollment, payment };
    });
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    await (0, notificationController_1.createNotification)(userId, client_1.NotificationType.ENROLLMENT, 'Enrollment Successful!', `Payment confirmed! You are now enrolled in "${course?.title}". Start learning now!`, `/student/courses/${courseId}`);
    await (0, notificationController_1.createNotification)(userId, client_1.NotificationType.PAYMENT, 'Payment Received', `Your payment of ₹${result.payment.amount} for "${course?.title}" was successful.`, `/student/dashboard`);
    // Send Email
    try {
        await (0, sendEmail_1.default)({
            email: req.user.email,
            subject: 'Payment Receipt & Enrollment Confirmation',
            message: `Your payment for "${course?.title}" was successful. You are now enrolled!`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Payment Successful!</h2>
                    <p>Hi ${req.user.name},</p>
                    <p>We received your payment of <strong>₹${result.payment.amount}</strong> for <strong>${course?.title}</strong>.</p>
                    <p>You have been successfully enrolled.</p>
                    <p>Start learning now by clicking the button below:</p>
                    <a href="${process.env.ZF_URL || 'http://localhost:5173'}/learn/${courseId}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Course</a>
                    <p style="margin-top: 20px; font-size: 12px; color: #666;">Transaction ID: ${razorpay_payment_id}<br>Nexus LMS Team</p>
                </div>
            `
        });
    }
    catch (err) {
        console.error('Email send failed', err);
    }
    res.status(201).json({
        status: 'success',
        data: {
            enrollment: result.enrollment,
            payment: result.payment
        }
    });
});
exports.getMyEnrollments = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
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
