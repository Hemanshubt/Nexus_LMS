"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const couponController_1 = require("../controllers/couponController");
const router = (0, express_1.Router)();
// Public route - validate coupon
router.post('/validate', authMiddleware_1.protect, couponController_1.validateCoupon);
// Admin routes
router.use(authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('ADMIN'));
router.get('/', couponController_1.getAllCoupons);
router.post('/', couponController_1.createCoupon);
router.patch('/:id', couponController_1.updateCoupon);
router.delete('/:id', couponController_1.deleteCoupon);
router.patch('/:id/toggle', couponController_1.toggleCouponStatus);
exports.default = router;
