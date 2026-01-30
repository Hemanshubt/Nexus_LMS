import { api } from './api';

export interface WishlistItem {
    id: string;
    userId: string;
    courseId: string;
    createdAt: string;
    course: {
        id: string;
        title: string;
        description?: string;
        thumbnail?: string;
        price: number;
        instructor: {
            id: string;
            name: string;
            avatar?: string;
        };
        _count: {
            enrollments: number;
            reviews: number;
        };
    };
}

// Get wishlist
export const getWishlist = async () => {
    const { data } = await api.get<{ data: { wishlist: WishlistItem[] } }>('/wishlist');
    return data.data.wishlist;
};

// Add to wishlist
export const addToWishlist = async (courseId: string) => {
    const { data } = await api.post(`/wishlist/${courseId}`);
    return data.data;
};

// Remove from wishlist
export const removeFromWishlist = async (courseId: string) => {
    await api.delete(`/wishlist/${courseId}`);
};

// Check if in wishlist
export const checkWishlist = async (courseId: string) => {
    const { data } = await api.get<{ data: { isInWishlist: boolean } }>(`/wishlist/check/${courseId}`);
    return data.data.isInWishlist;
};

// Get wishlist count
export const getWishlistCount = async () => {
    const { data } = await api.get<{ data: { count: number } }>('/wishlist/count');
    return data.data.count;
};
