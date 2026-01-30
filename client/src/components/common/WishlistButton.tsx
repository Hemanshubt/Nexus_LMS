import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    addToWishlist,
    removeFromWishlist,
    checkWishlist,
} from '@/services/wishlistService';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
    courseId: string;
    variant?: 'icon' | 'default';
    className?: string;
}

const WishlistButton = ({ courseId, variant = 'icon', className }: WishlistButtonProps) => {
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [loading, setLoading] = useState(false);

    // Check if course is in wishlist on mount
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const status = await checkWishlist(courseId);
                setIsInWishlist(status);
            } catch (error) {
                console.error('Error checking wishlist status:', error);
            }
        };
        checkStatus();
    }, [courseId]);

    // Toggle wishlist
    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (loading) return;

        setLoading(true);
        try {
            if (isInWishlist) {
                await removeFromWishlist(courseId);
                setIsInWishlist(false);
            } else {
                await addToWishlist(courseId);
                setIsInWishlist(true);
            }
        } catch (error: any) {
            console.error('Wishlist error:', error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    if (variant === 'icon') {
        return (
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    'rounded-full hover:bg-red-100 dark:hover:bg-red-900/20',
                    className
                )}
                onClick={handleToggle}
                disabled={loading}
            >
                <Heart
                    className={cn(
                        'h-5 w-5 transition-colors',
                        isInWishlist
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-500 hover:text-red-500'
                    )}
                />
            </Button>
        );
    }

    return (
        <Button
            variant={isInWishlist ? 'destructive' : 'outline'}
            className={cn('gap-2', className)}
            onClick={handleToggle}
            disabled={loading}
        >
            <Heart
                className={cn(
                    'h-4 w-4',
                    isInWishlist && 'fill-current'
                )}
            />
            {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        </Button>
    );
};

export default WishlistButton;
