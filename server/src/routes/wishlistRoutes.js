"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const wishlistController_1 = require("../controllers/wishlistController");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(authMiddleware_1.protect);
// Get wishlist
router.get('/', wishlistController_1.getWishlist);
// Get wishlist count
router.get('/count', wishlistController_1.getWishlistCount);
// Check if course is in wishlist
router.get('/check/:courseId', wishlistController_1.checkWishlist);
// Add to wishlist
router.post('/:courseId', wishlistController_1.addToWishlist);
// Remove from wishlist
router.delete('/:courseId', wishlistController_1.removeFromWishlist);
exports.default = router;
