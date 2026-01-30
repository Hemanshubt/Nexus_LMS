"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const wishlistService_1 = require("@/services/wishlistService");
const utils_1 = require("@/lib/utils");
const WishlistButton = ({ courseId, variant = 'icon', className }) => {
    const [isInWishlist, setIsInWishlist] = (0, react_1.useState)(false);
    const [loading, setLoading] = (0, react_1.useState)(false);
    // Check if course is in wishlist on mount
    (0, react_1.useEffect)(() => {
        const checkStatus = async () => {
            try {
                const status = await (0, wishlistService_1.checkWishlist)(courseId);
                setIsInWishlist(status);
            }
            catch (error) {
                console.error('Error checking wishlist status:', error);
            }
        };
        checkStatus();
    }, [courseId]);
    // Toggle wishlist
    const handleToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (loading)
            return;
        setLoading(true);
        try {
            if (isInWishlist) {
                await (0, wishlistService_1.removeFromWishlist)(courseId);
                setIsInWishlist(false);
            }
            else {
                await (0, wishlistService_1.addToWishlist)(courseId);
                setIsInWishlist(true);
            }
        }
        catch (error) {
            console.error('Wishlist error:', error.response?.data?.message || error.message);
        }
        finally {
            setLoading(false);
        }
    };
    if (variant === 'icon') {
        return (<button_1.Button variant="ghost" size="icon" className={(0, utils_1.cn)('rounded-full hover:bg-red-100 dark:hover:bg-red-900/20', className)} onClick={handleToggle} disabled={loading}>
                <lucide_react_1.Heart className={(0, utils_1.cn)('h-5 w-5 transition-colors', isInWishlist
                ? 'fill-red-500 text-red-500'
                : 'text-gray-500 hover:text-red-500')}/>
            </button_1.Button>);
    }
    return (<button_1.Button variant={isInWishlist ? 'destructive' : 'outline'} className={(0, utils_1.cn)('gap-2', className)} onClick={handleToggle} disabled={loading}>
            <lucide_react_1.Heart className={(0, utils_1.cn)('h-4 w-4', isInWishlist && 'fill-current')}/>
            {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        </button_1.Button>);
};
exports.default = WishlistButton;
