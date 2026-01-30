"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const wishlistService_1 = require("@/services/wishlistService");
const WishlistPage = () => {
    const [wishlist, setWishlist] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        fetchWishlist();
    }, []);
    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const data = await (0, wishlistService_1.getWishlist)();
            setWishlist(data);
        }
        catch (error) {
            console.error('Error fetching wishlist:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleRemove = async (courseId) => {
        try {
            await (0, wishlistService_1.removeFromWishlist)(courseId);
            setWishlist((prev) => prev.filter((item) => item.courseId !== courseId));
        }
        catch (error) {
            console.error('Failed to remove course:', error);
        }
    };
    if (loading) {
        return (<div className="container max-w-6xl mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (<card_1.Card key={i} className="overflow-hidden animate-pulse">
                            <div className="h-40 w-full bg-muted"/>
                            <card_1.CardContent className="p-4">
                                <div className="h-6 w-3/4 bg-muted rounded mb-2"/>
                                <div className="h-4 w-1/2 bg-muted rounded"/>
                            </card_1.CardContent>
                        </card_1.Card>))}
                </div>
            </div>);
    }
    return (<div className="container max-w-6xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <lucide_react_1.Heart className="h-8 w-8 text-red-500 fill-red-500"/>
                    <h1 className="text-3xl font-bold">My Wishlist</h1>
                    <badge_1.Badge variant="secondary" className="text-lg px-3 py-1">
                        {wishlist.length}
                    </badge_1.Badge>
                </div>
            </div>

            {wishlist.length === 0 ? (<div className="text-center py-16">
                    <lucide_react_1.Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4"/>
                    <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
                    <p className="text-muted-foreground mb-6">
                        Browse courses and add your favorites here!
                    </p>
                    <react_router_dom_1.Link to="/courses">
                        <button_1.Button size="lg">
                            <lucide_react_1.BookOpen className="mr-2 h-5 w-5"/>
                            Browse Courses
                        </button_1.Button>
                    </react_router_dom_1.Link>
                </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((item) => (<card_1.Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                            <div className="relative">
                                <img src={item.course.thumbnail || '/placeholder-course.jpg'} alt={item.course.title} className="w-full h-40 object-cover"/>
                                <button_1.Button variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemove(item.courseId)}>
                                    <lucide_react_1.Trash2 className="h-4 w-4"/>
                                </button_1.Button>
                            </div>
                            <card_1.CardContent className="p-4">
                                <react_router_dom_1.Link to={`/courses/${item.courseId}`} className="hover:underline">
                                    <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                                        {item.course.title}
                                    </h3>
                                </react_router_dom_1.Link>
                                <p className="text-sm text-muted-foreground mb-2">
                                    by {item.course.instructor.name}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>{item.course._count.enrollments} enrolled</span>
                                    <span>{item.course._count.reviews} reviews</span>
                                </div>
                            </card_1.CardContent>
                            <card_1.CardFooter className="p-4 pt-0 flex items-center justify-between">
                                <span className="text-xl font-bold text-primary">
                                    {item.course.price === 0
                    ? 'Free'
                    : `₹${item.course.price.toLocaleString()}`}
                                </span>
                                <react_router_dom_1.Link to={`/courses/${item.courseId}`}>
                                    <button_1.Button size="sm">
                                        <lucide_react_1.ShoppingCart className="mr-2 h-4 w-4"/>
                                        View Course
                                    </button_1.Button>
                                </react_router_dom_1.Link>
                            </card_1.CardFooter>
                        </card_1.Card>))}
                </div>)}
        </div>);
};
exports.default = WishlistPage;
