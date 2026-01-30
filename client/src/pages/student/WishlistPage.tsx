import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getWishlist, removeFromWishlist, WishlistItem } from '@/services/wishlistService';

const WishlistPage = () => {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const data = await getWishlist();
            setWishlist(data);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (courseId: string) => {
        try {
            await removeFromWishlist(courseId);
            setWishlist((prev) => prev.filter((item) => item.courseId !== courseId));
        } catch (error) {
            console.error('Failed to remove course:', error);
        }
    };

    if (loading) {
        return (
            <div className="container max-w-6xl mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="overflow-hidden animate-pulse">
                            <div className="h-40 w-full bg-muted" />
                            <CardContent className="p-4">
                                <div className="h-6 w-3/4 bg-muted rounded mb-2" />
                                <div className="h-4 w-1/2 bg-muted rounded" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-6xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                    <h1 className="text-3xl font-bold">My Wishlist</h1>
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                        {wishlist.length}
                    </Badge>
                </div>
            </div>

            {wishlist.length === 0 ? (
                <div className="text-center py-16">
                    <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
                    <p className="text-muted-foreground mb-6">
                        Browse courses and add your favorites here!
                    </p>
                    <Link to="/courses">
                        <Button size="lg">
                            <BookOpen className="mr-2 h-5 w-5" />
                            Browse Courses
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((item) => (
                        <Card
                            key={item.id}
                            className="overflow-hidden group hover:shadow-lg transition-shadow"
                        >
                            <div className="relative">
                                <img
                                    src={item.course.thumbnail || '/placeholder-course.jpg'}
                                    alt={item.course.title}
                                    className="w-full h-40 object-cover"
                                />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleRemove(item.courseId)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <CardContent className="p-4">
                                <Link
                                    to={`/courses/${item.courseId}`}
                                    className="hover:underline"
                                >
                                    <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                                        {item.course.title}
                                    </h3>
                                </Link>
                                <p className="text-sm text-muted-foreground mb-2">
                                    by {item.course.instructor.name}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>{item.course._count.enrollments} enrolled</span>
                                    <span>{item.course._count.reviews} reviews</span>
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-0 flex items-center justify-between">
                                <span className="text-xl font-bold text-primary">
                                    {item.course.price === 0
                                        ? 'Free'
                                        : `₹${item.course.price.toLocaleString()}`}
                                </span>
                                <Link to={`/courses/${item.courseId}`}>
                                    <Button size="sm">
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        View Course
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;
