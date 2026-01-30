import { Request, Response, NextFunction } from 'express';
import { PrismaClient, DiscountType } from '@prisma/client';
import { AppError } from '../utils/appError';

const prisma = new PrismaClient();

// Validate coupon
export const validateCoupon = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code, courseId } = req.body;
        const userId = req.user?.id;

        if (!code) {
            return next(new AppError('Coupon code is required', 400));
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
            include: {
                courses: { select: { id: true } }
            }
        });

        if (!coupon) {
            return next(new AppError('Invalid coupon code', 404));
        }

        // Check if active
        if (!coupon.isActive) {
            return next(new AppError('This coupon is no longer active', 400));
        }

        // Check validity dates
        const now = new Date();
        if (coupon.validFrom > now) {
            return next(new AppError('This coupon is not yet valid', 400));
        }
        if (coupon.validUntil && coupon.validUntil < now) {
            return next(new AppError('This coupon has expired', 400));
        }

        // Check usage limits
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return next(new AppError('This coupon has reached its usage limit', 400));
        }

        // Check per-user limit
        if (userId) {
            const userUsageCount = await prisma.couponUsage.count({
                where: { couponId: coupon.id, userId }
            });
            if (userUsageCount >= coupon.perUserLimit) {
                return next(new AppError('You have already used this coupon', 400));
            }
        }

        // Check if coupon is restricted to specific courses
        if (coupon.courses.length > 0 && courseId) {
            const isValidForCourse = coupon.courses.some(c => c.id === courseId);
            if (!isValidForCourse) {
                return next(new AppError('This coupon is not valid for this course', 400));
            }
        }

        // Get course price if courseId provided
        let discountAmount = 0;
        let finalPrice = 0;

        if (courseId) {
            const course = await prisma.course.findUnique({
                where: { id: courseId }
            });

            if (!course) {
                return next(new AppError('Course not found', 404));
            }

            // Check minimum purchase
            if (coupon.minPurchase && course.price < coupon.minPurchase) {
                return next(new AppError(`Minimum purchase of ₹${coupon.minPurchase} required`, 400));
            }

            // Calculate discount
            if (coupon.discountType === DiscountType.PERCENTAGE) {
                discountAmount = (course.price * coupon.discountValue) / 100;
                // Apply max discount cap
                if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                    discountAmount = coupon.maxDiscount;
                }
            } else {
                discountAmount = coupon.discountValue;
            }

            // Ensure discount doesn't exceed price
            discountAmount = Math.min(discountAmount, course.price);
            finalPrice = Math.max(0, course.price - discountAmount);
        }

        res.status(200).json({
            status: 'success',
            data: {
                valid: true,
                coupon: {
                    id: coupon.id,
                    code: coupon.code,
                    description: coupon.description,
                    discountType: coupon.discountType,
                    discountValue: coupon.discountValue,
                    maxDiscount: coupon.maxDiscount
                },
                discountAmount,
                finalPrice
            }
        });
    } catch (error) {
        next(error);
    }
};

// Apply coupon (record usage)
export const applyCoupon = async (
    couponCode: string,
    userId: string,
    orderId: string,
    coursePrice: number
) => {
    const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() }
    });

    if (!coupon) return { discount: 0, finalPrice: coursePrice };

    let discountAmount = 0;

    if (coupon.discountType === DiscountType.PERCENTAGE) {
        discountAmount = (coursePrice * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
        }
    } else {
        discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, coursePrice);
    const finalPrice = Math.max(0, coursePrice - discountAmount);

    // Record usage and increment count
    await prisma.$transaction([
        prisma.couponUsage.create({
            data: {
                couponId: coupon.id,
                userId,
                orderId,
                discount: discountAmount
            }
        }),
        prisma.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } }
        })
    ]);

    return { discount: discountAmount, finalPrice };
};

// ─────────────────────────────────────────
// Admin endpoints
// ─────────────────────────────────────────

// Get all coupons (admin)
export const getAllCoupons = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const coupons = await prisma.coupon.findMany({
            include: {
                courses: { select: { id: true, title: true } },
                _count: { select: { usages: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({
            status: 'success',
            data: { coupons }
        });
    } catch (error) {
        next(error);
    }
};

// Create coupon (admin)
export const createCoupon = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            code,
            description,
            discountType = 'PERCENTAGE',
            discountValue,
            minPurchase,
            maxDiscount,
            usageLimit,
            perUserLimit = 1,
            validFrom,
            validUntil,
            courseIds = []
        } = req.body;

        if (!code || discountValue === undefined) {
            return next(new AppError('Code and discountValue are required', 400));
        }

        // Check if code already exists
        const existing = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (existing) {
            return next(new AppError('Coupon code already exists', 400));
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase(),
                description,
                discountType,
                discountValue: parseFloat(discountValue),
                minPurchase: minPurchase ? parseFloat(minPurchase) : null,
                maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
                usageLimit: usageLimit ? parseInt(usageLimit) : null,
                perUserLimit: parseInt(perUserLimit),
                validFrom: validFrom ? new Date(validFrom) : new Date(),
                validUntil: validUntil ? new Date(validUntil) : null,
                courses: courseIds.length > 0 ? {
                    connect: courseIds.map((id: string) => ({ id }))
                } : undefined
            }
        });

        res.status(201).json({
            status: 'success',
            data: { coupon }
        });
    } catch (error) {
        next(error);
    }
};

// Update coupon (admin)
export const updateCoupon = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const data = { ...req.body };

        // Format data
        if (data.code) data.code = data.code.toUpperCase();
        if (data.discountValue) data.discountValue = parseFloat(data.discountValue);
        if (data.minPurchase) data.minPurchase = parseFloat(data.minPurchase);
        if (data.maxDiscount) data.maxDiscount = parseFloat(data.maxDiscount);
        if (data.usageLimit) data.usageLimit = parseInt(data.usageLimit);
        if (data.perUserLimit) data.perUserLimit = parseInt(data.perUserLimit);
        if (data.validFrom) data.validFrom = new Date(data.validFrom);
        if (data.validUntil) data.validUntil = new Date(data.validUntil);

        const coupon = await prisma.coupon.update({
            where: { id },
            data
        });

        res.status(200).json({
            status: 'success',
            data: { coupon }
        });
    } catch (error) {
        next(error);
    }
};

// Delete coupon (admin)
export const deleteCoupon = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        await prisma.coupon.delete({ where: { id } });

        res.status(200).json({
            status: 'success',
            message: 'Coupon deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Toggle coupon status (admin)
export const toggleCouponStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const coupon = await prisma.coupon.findUnique({ where: { id } });
        if (!coupon) {
            return next(new AppError('Coupon not found', 404));
        }

        const updated = await prisma.coupon.update({
            where: { id },
            data: { isActive: !coupon.isActive }
        });

        res.status(200).json({
            status: 'success',
            data: { coupon: updated }
        });
    } catch (error) {
        next(error);
    }
};
