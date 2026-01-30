"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageUploadSignature = exports.getUploadSignature = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const cloudinary_1 = require("cloudinary");
// Configure Cloudinary (ensure these are in your .env)
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
exports.getUploadSignature = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const timestamp = Math.round((new Date).getTime() / 1000);
    const folder = 'lms_courses'; // Optional folder on Cloudinary
    // Sign the parameters
    const signature = cloudinary_1.v2.utils.api_sign_request({
        timestamp: timestamp,
        folder: folder,
    }, process.env.CLOUDINARY_API_SECRET);
    res.status(200).json({
        status: 'success',
        data: {
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            folder
        }
    });
});
exports.getImageUploadSignature = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const timestamp = Math.round((new Date).getTime() / 1000);
    const folder = 'lms_avatars';
    const signature = cloudinary_1.v2.utils.api_sign_request({
        timestamp: timestamp,
        folder: folder,
    }, process.env.CLOUDINARY_API_SECRET);
    res.status(200).json({
        status: 'success',
        data: {
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            folder
        }
    });
});
