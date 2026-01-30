import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createCoupon, updateCoupon, Coupon } from "@/services/couponService";
import { Loader2 } from "lucide-react";

interface CouponDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    coupon?: Coupon | null;
    courses: { id: string; title: string }[];
    onSuccess: () => void;
}

export function CouponDialog({ open, onOpenChange, coupon, courses, onSuccess }: CouponDialogProps) {
    const isEditing = !!coupon;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        code: "",
        description: "",
        discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
        discountValue: "",
        maxDiscount: "",
        minPurchase: "",
        usageLimit: "",
        perUserLimit: "1",
        validFrom: "",
        validUntil: "",
        courseIds: [] as string[]
    });

    useEffect(() => {
        if (coupon) {
            setFormData({
                code: coupon.code,
                description: coupon.description || "",
                discountType: coupon.discountType,
                discountValue: coupon.discountValue.toString(),
                maxDiscount: coupon.maxDiscount?.toString() || "",
                minPurchase: coupon.minPurchase?.toString() || "",
                usageLimit: coupon.usageLimit?.toString() || "",
                perUserLimit: coupon.perUserLimit.toString(),
                validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().slice(0, 16) : "",
                validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().slice(0, 16) : "",
                courseIds: coupon.courses?.map(c => c.id) || []
            });
        } else {
            setFormData({
                code: "",
                description: "",
                discountType: "PERCENTAGE",
                discountValue: "",
                maxDiscount: "",
                minPurchase: "",
                usageLimit: "",
                perUserLimit: "1",
                validFrom: "",
                validUntil: "",
                courseIds: []
            });
        }
        setError("");
    }, [coupon, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const payload: any = {
                ...formData,
                discountValue: parseFloat(formData.discountValue),
                maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
                minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : undefined,
                usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
                perUserLimit: parseInt(formData.perUserLimit),
                validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : undefined,
                validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : undefined,
            };

            if (isEditing && coupon) {
                await updateCoupon(coupon.id, payload);
            } else {
                await createCoupon(payload);
            }
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleCourse = (courseId: string) => {
        setFormData(prev => ({
            ...prev,
            courseIds: prev.courseIds.includes(courseId)
                ? prev.courseIds.filter(id => id !== courseId)
                : [...prev.courseIds, courseId]
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Coupon" : "Create New Coupon"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Coupon Code</Label>
                            <Input
                                placeholder="SUMMER2024"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                placeholder="Summer Sale Discount"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Discount Type</Label>
                        <RadioGroup
                            value={formData.discountType}
                            onValueChange={(val: "PERCENTAGE" | "FIXED") => setFormData({ ...formData, discountType: val })}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="PERCENTAGE" id="pct" />
                                <Label htmlFor="pct">Percentage (%)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="FIXED" id="fixed" />
                                <Label htmlFor="fixed">Fixed Amount (₹)</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{formData.discountType === 'PERCENTAGE' ? 'Percentage (%)' : 'Amount (₹)'}</Label>
                            <Input
                                type="number"
                                min="0"
                                value={formData.discountValue}
                                onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                                required
                            />
                        </div>
                        {formData.discountType === 'PERCENTAGE' && (
                            <div className="space-y-2">
                                <Label>Max Discount Amount (₹)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    placeholder="Optional limit"
                                    value={formData.maxDiscount}
                                    onChange={e => setFormData({ ...formData, maxDiscount: e.target.value })}
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Min Purchase (₹)</Label>
                            <Input
                                type="number"
                                min="0"
                                placeholder="0 for no limit"
                                value={formData.minPurchase}
                                onChange={e => setFormData({ ...formData, minPurchase: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Total Usage Limit</Label>
                            <Input
                                type="number"
                                min="0"
                                placeholder="Unlimited"
                                value={formData.usageLimit}
                                onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Valid From</Label>
                            <Input
                                type="datetime-local"
                                value={formData.validFrom}
                                onChange={e => setFormData({ ...formData, validFrom: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Valid Until</Label>
                            <Input
                                type="datetime-local"
                                value={formData.validUntil}
                                onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Restrict to Specific Courses (Optional)</Label>
                        <div className="border rounded p-4 h-32 overflow-y-auto space-y-2">
                            {courses.map(course => (
                                <div key={course.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`course-${course.id}`}
                                        checked={formData.courseIds.includes(course.id)}
                                        onChange={() => toggleCourse(course.id)}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label htmlFor={`course-${course.id}`} className="text-sm">
                                        {course.title}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Save Changes" : "Create Coupon"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
