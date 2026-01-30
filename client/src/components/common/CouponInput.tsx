import { useState } from 'react';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validateCoupon, CouponValidation } from '@/services/couponService';
import { cn } from '@/lib/utils';

interface CouponInputProps {
    courseId: string;
    originalPrice: number;
    onApply: (validation: CouponValidation | null) => void;
    className?: string;
}

const CouponInput = ({ courseId, originalPrice, onApply, className }: CouponInputProps) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [applied, setApplied] = useState<CouponValidation | null>(null);

    const handleApply = async () => {
        if (!code.trim()) {
            setError('Please enter a coupon code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const validation = await validateCoupon(code.trim(), courseId);
            setApplied(validation);
            onApply(validation);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid coupon code');
            setApplied(null);
            onApply(null);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        setCode('');
        setApplied(null);
        setError('');
        onApply(null);
    };

    if (applied) {
        return (
            <div className={cn('p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg', className)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
                            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="font-medium text-green-700 dark:text-green-300">
                                Coupon Applied!
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                                {applied.coupon.code} - {applied.coupon.discountType === 'PERCENTAGE'
                                    ? `${applied.coupon.discountValue}% off`
                                    : `₹${applied.coupon.discountValue} off`
                                }
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemove}
                        className="text-green-600 hover:text-green-800"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Original Price</span>
                        <span className="line-through">₹{originalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                        <span>Discount</span>
                        <span>-₹{applied.discountAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold mt-1">
                        <span>Final Price</span>
                        <span className="text-primary">₹{applied.finalPrice.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Enter coupon code"
                        value={code}
                        onChange={(e) => {
                            setCode(e.target.value.toUpperCase());
                            setError('');
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                        className={cn(
                            'pl-10 uppercase',
                            error && 'border-red-500 focus-visible:ring-red-500'
                        )}
                        disabled={loading}
                    />
                </div>
                <Button
                    onClick={handleApply}
                    disabled={loading || !code.trim()}
                    variant="outline"
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        'Apply'
                    )}
                </Button>
            </div>
            {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {error}
                </p>
            )}
        </div>
    );
};

export default CouponInput;
