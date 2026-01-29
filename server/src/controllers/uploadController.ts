import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (ensure these are in your .env)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getUploadSignature = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const timestamp = Math.round((new Date).getTime() / 1000);
    const folder = 'lms_courses'; // Optional folder on Cloudinary

    // Sign the parameters
    const signature = cloudinary.utils.api_sign_request({
        timestamp: timestamp,
        folder: folder,
    }, process.env.CLOUDINARY_API_SECRET!);

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

export const getImageUploadSignature = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const timestamp = Math.round((new Date).getTime() / 1000);
    const folder = 'lms_avatars';

    const signature = cloudinary.utils.api_sign_request({
        timestamp: timestamp,
        folder: folder,
    }, process.env.CLOUDINARY_API_SECRET!);

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
