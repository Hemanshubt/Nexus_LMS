import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkWishlist,
    getWishlistCount
} from '../controllers/wishlistController';

const router = Router();

// All routes require authentication
router.use(protect);

// Get wishlist
router.get('/', getWishlist);

// Get wishlist count
router.get('/count', getWishlistCount);

// Check if course is in wishlist
router.get('/check/:courseId', checkWishlist);

// Add to wishlist
router.post('/:courseId', addToWishlist);

// Remove from wishlist
router.delete('/:courseId', removeFromWishlist);

export default router;
