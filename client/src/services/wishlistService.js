"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWishlistCount = exports.checkWishlist = exports.removeFromWishlist = exports.addToWishlist = exports.getWishlist = void 0;
const api_1 = require("./api");
// Get wishlist
const getWishlist = async () => {
    const { data } = await api_1.api.get('/wishlist');
    return data.data.wishlist;
};
exports.getWishlist = getWishlist;
// Add to wishlist
const addToWishlist = async (courseId) => {
    const { data } = await api_1.api.post(`/wishlist/${courseId}`);
    return data.data;
};
exports.addToWishlist = addToWishlist;
// Remove from wishlist
const removeFromWishlist = async (courseId) => {
    await api_1.api.delete(`/wishlist/${courseId}`);
};
exports.removeFromWishlist = removeFromWishlist;
// Check if in wishlist
const checkWishlist = async (courseId) => {
    const { data } = await api_1.api.get(`/wishlist/check/${courseId}`);
    return data.data.isInWishlist;
};
exports.checkWishlist = checkWishlist;
// Get wishlist count
const getWishlistCount = async () => {
    const { data } = await api_1.api.get('/wishlist/count');
    return data.data.count;
};
exports.getWishlistCount = getWishlistCount;
