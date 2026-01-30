import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware';
import {
    validateCoupon,
    getAllCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus
} from '../controllers/couponController';

const router = Router();

// Public route - validate coupon
router.post('/validate', protect, validateCoupon);

// Admin routes
router.use(protect, restrictTo('ADMIN'));

router.get('/', getAllCoupons);
router.post('/', createCoupon);
router.patch('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);
router.patch('/:id/toggle', toggleCouponStatus);

export default router;
