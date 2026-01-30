"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CourseReviews;
const react_1 = require("react");
const api_1 = require("@/services/api");
const button_1 = require("@/components/ui/button");
const textarea_1 = require("@/components/ui/textarea");
const lucide_react_1 = require("lucide-react");
const card_1 = require("@/components/ui/card");
function CourseReviews({ courseId, isEnrolled }) {
    const [reviews, setReviews] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [rating, setRating] = (0, react_1.useState)(5);
    const [comment, setComment] = (0, react_1.useState)("");
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        fetchReviews();
    }, [courseId]);
    const fetchReviews = async () => {
        try {
            const res = await api_1.api.get(`/reviews/course/${courseId}`);
            setReviews(res.data.data.reviews);
        }
        catch (error) {
            console.error("Failed to fetch reviews", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api_1.api.post(`/reviews/course/${courseId}`, { rating, comment });
            setComment("");
            fetchReviews();
        }
        catch (error) {
            console.error("Failed to submit review", error);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (isLoading)
        return <div className="flex justify-center p-8"><lucide_react_1.Loader2 className="animate-spin"/></div>;
    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "0.0";
    return (<div className="space-y-8">
            <div className="flex items-center gap-6">
                <div className="text-center">
                    <div className="text-5xl font-bold text-primary">{avgRating}</div>
                    <div className="flex justify-center my-2">
                        {[1, 2, 3, 4, 5].map((s) => (<lucide_react_1.Star key={s} className={`w-4 h-4 ${Number(avgRating) >= s ? 'fill-primary text-primary' : 'text-muted'}`}/>))}
                    </div>
                    <div className="text-sm font-bold text-muted-foreground uppercase">Course Rating</div>
                </div>
                <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((s) => {
            const count = reviews.filter(r => r.rating === s).length;
            const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (<div key={s} className="flex items-center gap-4 text-sm">
                                <div className="w-12 flex items-center gap-1 font-medium">
                                    {s} <lucide_react_1.Star className="w-3 h-3 fill-current"/>
                                </div>
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${percent}%` }}/>
                                </div>
                                <div className="w-8 text-right text-muted-foreground">{count}</div>
                            </div>);
        })}
                </div>
            </div>

            {/* Submit Review */}
            {isEnrolled && (<card_1.Card>
                    <card_1.CardHeader>
                        <card_1.CardTitle className="text-lg">Leave a Review</card_1.CardTitle>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((s) => (<button key={s} type="button" onClick={() => setRating(s)} className="focus:outline-none transition-transform active:scale-90">
                                        <lucide_react_1.Star className={`w-8 h-8 ${rating >= s ? 'fill-primary text-primary' : 'text-muted-foreground hover:text-primary/50'}`}/>
                                    </button>))}
                            </div>
                            <textarea_1.Textarea placeholder="What did you think of the course?" value={comment} onChange={(e) => setComment(e.target.value)} className="min-h-[100px]"/>
                            <div className="flex justify-end">
                                <button_1.Button type="submit" disabled={isSubmitting || !comment}>
                                    {isSubmitting ? "Submitting..." : "Submit Review"}
                                </button_1.Button>
                            </div>
                        </form>
                    </card_1.CardContent>
                </card_1.Card>)}

            {/* Reviews List */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <lucide_react_1.MessageSquare className="w-5 h-5"/> Reviews ({reviews.length})
                </h3>
                <div className="grid gap-6">
                    {reviews.length === 0 ? (<p className="text-muted-foreground text-center py-8 border rounded-lg border-dashed">No reviews yet. Be the first to leave one!</p>) : (reviews.map((review) => (<div key={review.id} className="border-t pt-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0">
                                        {review.user.avatar ? (<img src={review.user.avatar} alt={review.user.name} className="w-full h-full object-cover"/>) : (<div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground">
                                                {review.user.name[0]}
                                            </div>)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold">{review.user.name}</h4>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex mb-2">
                                            {[1, 2, 3, 4, 5].map((s) => (<lucide_react_1.Star key={s} className={`w-3 h-3 ${review.rating >= s ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}/>))}
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {review.comment}
                                        </p>
                                    </div>
                                </div>
                            </div>)))}
                </div>
            </div>
        </div>);
}
