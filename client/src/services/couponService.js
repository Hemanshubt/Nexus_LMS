"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleCouponStatus = exports.deleteCoupon = exports.updateCoupon = exports.createCoupon = exports.getCoupons = exports.validateCoupon = void 0;
const api_1 = require("./api");
// Validate coupon code
const validateCoupon = async (code, courseId) => {
    const { data } = await api_1.api.post('/coupons/validate', {
        code,
        courseId
    });
    return data.data;
};
exports.validateCoupon = validateCoupon;
// Admin: Get all coupons
const getCoupons = async () => {
    const { data } = await api_1.api.get('/coupons');
    return data.data.coupons;
};
exports.getCoupons = getCoupons;
// Admin: Create coupon
const createCoupon = async (couponData) => {
    const { data } = await api_1.api.post('/coupons', couponData);
    return data.data.coupon;
};
exports.createCoupon = createCoupon;
// Admin: Update coupon
const updateCoupon = async (id, couponData) => {
    const { data } = await api_1.api.patch(`/coupons/${id}`, couponData);
    return data.data.coupon;
};
exports.updateCoupon = updateCoupon;
// Admin: Delete coupon
const deleteCoupon = async (id) => {
    await api_1.api.delete(`/coupons/${id}`);
};
exports.deleteCoupon = deleteCoupon;
// Admin: Toggle coupon status
const toggleCouponStatus = async (id) => {
    const { data } = await api_1.api.patch(`/coupons/${id}/toggle`);
    return data.data.coupon;
};
exports.toggleCouponStatus = toggleCouponStatus;
