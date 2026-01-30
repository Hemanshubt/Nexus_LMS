import { api } from './api';

export interface Coupon {
    id: string;
    code: string;
    description?: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    maxDiscount?: number;
}

export interface CouponValidation {
    valid: boolean;
    coupon: Coupon;
    discountAmount: number;
    finalPrice: number;
}

// Validate coupon code
export const validateCoupon = async (
    code: string,
    courseId?: string
): Promise<CouponValidation> => {
    const { data } = await api.post<{ data: CouponValidation }>('/coupons/validate', {
        code,
        courseId
    });
    return data.data;
};

// Admin: Get all coupons
export const getCoupons = async () => {
    const { data } = await api.get('/coupons');
    return data.data.coupons;
};

// Admin: Create coupon
export const createCoupon = async (couponData: {
    code: string;
    description?: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    minPurchase?: number;
    maxDiscount?: number;
    usageLimit?: number;
    perUserLimit?: number;
    validFrom?: string;
    validUntil?: string;
    courseIds?: string[];
}) => {
    const { data } = await api.post('/coupons', couponData);
    return data.data.coupon;
};

// Admin: Update coupon
export const updateCoupon = async (id: string, couponData: Partial<typeof createCoupon>) => {
    const { data } = await api.patch(`/coupons/${id}`, couponData);
    return data.data.coupon;
};

// Admin: Delete coupon
export const deleteCoupon = async (id: string) => {
    await api.delete(`/coupons/${id}`);
};

// Admin: Toggle coupon status
export const toggleCouponStatus = async (id: string) => {
    const { data } = await api.patch(`/coupons/${id}/toggle`);
    return data.data.coupon;
};
