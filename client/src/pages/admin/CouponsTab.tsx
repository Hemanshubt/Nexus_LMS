import { useState, useEffect } from "react";
import { getCoupons, deleteCoupon, toggleCouponStatus, Coupon } from "@/services/couponService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2, Power } from "lucide-react";
import { CouponDialog } from "@/components/admin/CouponDialog";

interface CouponsTabProps {
    courses: { id: string; title: string }[];
}

export function CouponsTab({ courses }: CouponsTabProps) {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

    const fetchCoupons = async () => {
        try {
            const data = await getCoupons();
            setCoupons(data);
        } catch (error) {
            console.error("Failed to fetch coupons", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleEdit = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingCoupon(null);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;
        try {
            await deleteCoupon(id);
            setCoupons(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error("Failed to delete coupon", error);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await toggleCouponStatus(id);
            setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
        } catch (error) {
            console.error("Failed to toggle status", error);
        }
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Coupons</h2>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Create Coupon
                </Button>
            </div>

            <Card className="border-none shadow-md overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Usage</TableHead>
                            <TableHead>Validity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {coupons.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No coupons found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            coupons.map((coupon) => (
                                <TableRow key={coupon.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold font-mono">{coupon.code}</span>
                                            {coupon.description && <span className="text-xs text-muted-foreground">{coupon.description}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {coupon.discountType === 'PERCENTAGE'
                                                ? `${coupon.discountValue}% OFF`
                                                : `₹${coupon.discountValue} OFF`}
                                        </Badge>
                                        {coupon.minPurchase ? <div className="text-xs mt-1 text-muted-foreground">Min: ₹{coupon.minPurchase}</div> : null}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {coupon.usedCount} / {coupon.usageLimit ? coupon.usageLimit : '∞'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs text-muted-foreground">
                                            {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : "No Expiry"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={coupon.isActive ? "default" : "destructive"}>
                                            {coupon.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(coupon.id, coupon.isActive)} title="Toggle Status">
                                                <Power className={`h-4 w-4 ${coupon.isActive ? "text-green-600" : "text-gray-400"}`} />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(coupon)} title="Edit">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)} title="Delete" className="text-red-500 hover:text-red-600">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            <CouponDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                coupon={editingCoupon}
                courses={courses}
                onSuccess={fetchCoupons}
            />
        </div>
    );
}
