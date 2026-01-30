"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CoursePlayerPage;
const CourseSidebar_1 = __importDefault(require("@/components/course/CourseSidebar"));
const react_router_dom_1 = require("react-router-dom");
const react_1 = require("react");
const api_1 = require("@/services/api");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
const payment_1 = require("@/lib/payment");
const QuizPlayer_1 = __importDefault(require("@/components/student/QuizPlayer"));
const AssignmentPlayer_1 = __importDefault(require("@/components/student/AssignmentPlayer"));
const CourseReviews_1 = __importDefault(require("@/components/course/CourseReviews"));
const LessonQA_1 = __importDefault(require("@/components/student/LessonQA"));
const tabs_1 = require("@/components/ui/tabs");
const CouponInput_1 = __importDefault(require("@/components/common/CouponInput"));
function CoursePlayerPage() {
    const { courseId } = (0, react_router_dom_1.useParams)();
    const [course, setCourse] = (0, react_1.useState)(null);
    const [activeLessonId, setActiveLessonId] = (0, react_1.useState)("");
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [isEnrolled, setIsEnrolled] = (0, react_1.useState)(false);
    const [completedLessons, setCompletedLessons] = (0, react_1.useState)([]);
    const [isBuying, setIsBuying] = (0, react_1.useState)(false);
    const [appliedCoupon, setAppliedCoupon] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (courseId) {
            fetchCourse();
        }
    }, [courseId]);
    const fetchCourse = async () => {
        try {
            const cRes = await api_1.api.get(`/courses/${courseId}`);
            let isEnrolledVal = false;
            let completedIds = [];
            try {
                const sRes = await api_1.api.get(`/enrollments/status/${courseId}`);
                isEnrolledVal = sRes.data.data.isEnrolled;
                if (isEnrolledVal) {
                    const pRes = await api_1.api.get(`/progress/${courseId}`);
                    completedIds = pRes.data.data.completedLessonIds;
                }
            }
            catch (e) {
                // Ignore if auth fails or not enrolled
            }
            const fetchedCourse = cRes.data.data.course;
            setCourse(fetchedCourse);
            setIsEnrolled(isEnrolledVal);
            setCompletedLessons(completedIds);
            // Set first lesson as active by default if available
            if (fetchedCourse.sections?.length > 0 && fetchedCourse.sections[0].lessons?.length > 0) {
                setActiveLessonId(fetchedCourse.sections[0].lessons[0].id);
            }
        }
        catch (error) {
            console.error("Failed to fetch player data", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const markAsComplete = async () => {
        if (!activeLessonId)
            return;
        try {
            await api_1.api.post(`/progress/lessons/${activeLessonId}`, { isCompleted: true });
            if (!completedLessons.includes(activeLessonId)) {
                setCompletedLessons([...completedLessons, activeLessonId]);
            }
        }
        catch (error) {
            console.error("Failed to mark lesson complete", error);
        }
    };
    const handleBuyCourse = async () => {
        if (!course)
            return;
        setIsBuying(true);
        const loaded = await (0, payment_1.loadRazorpay)();
        if (!loaded) {
            alert('Razorpay SDK failed to load. Are you online?');
            setIsBuying(false);
            return;
        }
        try {
            const orderRes = await api_1.api.post('/enrollments/checkout', {
                courseId: course.id,
                couponCode: appliedCoupon?.coupon.code
            });
            if (orderRes.data.data.isFree) {
                setIsEnrolled(true);
                alert("You have been enrolled successfully!");
                return;
            }
            const { order } = orderRes.data.data;
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
                amount: order.amount,
                currency: order.currency,
                name: "Nexus LMS",
                description: `Enroll in ${course.title}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        await api_1.api.post('/enrollments/verify', {
                            courseId: course.id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        setIsEnrolled(true);
                        alert("Enrollment Successful! Welcome aboard.");
                    }
                    catch (verifyErr) {
                        console.error('Payment verification failed', verifyErr);
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                theme: { color: "#3399cc" }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        }
        catch (err) {
            console.error("Purchase failed", err);
            alert("Something went wrong initializing the purchase.");
        }
        finally {
            setIsBuying(false);
        }
    };
    const activeLesson = course?.sections
        .flatMap(s => s.lessons)
        .find(l => l.id === activeLessonId);
    const isLocked = !isEnrolled && (course?.price ?? 0) > 0;
    if (isLoading)
        return <div className="p-10 text-center">Loading learning environment...</div>;
    if (!course)
        return <div className="p-10 text-center">Course not found.</div>;
    return (<div className="flex h-[calc(100vh-64px)] w-full overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto bg-background p-6 custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Content Player Container */}
                    <div className="aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center relative shadow-2xl border border-white/5">
                        {isLocked ? (<div className="absolute inset-0 z-10 bg-black/95 flex flex-col items-center justify-center text-center p-8 space-y-6 backdrop-blur-md">
                                <div className="bg-primary/20 p-6 rounded-full animate-pulse">
                                    <lucide_react_1.Lock className="w-12 h-12 text-primary"/>
                                </div>
                                <div className="space-y-2 max-w-md mx-auto">
                                    <h2 className="text-3xl font-bold text-white tracking-tight">Access Restricted</h2>
                                    <p className="text-white/60 leading-relaxed">
                                        Unlock full lifetime access to this course and all future updates.
                                    </p>
                                </div>

                                <div className="w-full max-w-sm mx-auto space-y-4">
                                    <CouponInput_1.default courseId={course.id} originalPrice={course.price} onApply={setAppliedCoupon} className="bg-white/5 p-4 rounded-xl border border-white/10"/>

                                    <button_1.Button size="lg" onClick={handleBuyCourse} disabled={isBuying} className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20">
                                        {isBuying ? "Processing..." : (appliedCoupon
                ? `Enroll Now • ₹${appliedCoupon.finalPrice}`
                : `Enroll Now • ₹${course.price}`)}
                                    </button_1.Button>
                                </div>
                            </div>) : (activeLesson ? (activeLesson.type === 'QUIZ' ? (<div className="w-full h-full bg-background text-foreground overflow-y-auto p-4">
                                        <QuizPlayer_1.default lessonId={activeLesson.id} onComplete={() => {
                if (!completedLessons.includes(activeLesson.id)) {
                    setCompletedLessons([...completedLessons, activeLesson.id]);
                }
            }}/>
                                    </div>) : activeLesson.type === 'ASSIGNMENT' ? (<div className="w-full h-full bg-background text-foreground overflow-y-auto p-4">
                                        <AssignmentPlayer_1.default lessonId={activeLesson.id} onComplete={() => {
                if (!completedLessons.includes(activeLesson.id)) {
                    setCompletedLessons([...completedLessons, activeLesson.id]);
                }
            }}/>
                                    </div>) : activeLesson.type === 'TEXT' ? (<div className="w-full h-full bg-background text-foreground overflow-y-auto p-12 transition-all duration-500">
                                        <div className="max-w-3xl mx-auto prose prose-invert font-serif leading-loose text-lg">
                                            {activeLesson.content || "No content available."}
                                        </div>
                                    </div>) : (activeLesson.videoUrl ? (<video key={activeLesson.videoUrl} controls className="w-full h-full object-contain" src={activeLesson.videoUrl} controlsList="nodownload">
                                            Your browser does not support the video tag.
                                        </video>) : (<div className="text-white text-center space-y-4">
                                            <div className="text-primary text-5xl font-black">?</div>
                                            <p className="text-2xl font-bold">Incomplete Lesson</p>
                                            <p className="text-white/40">The instructor hasn't uploaded video for this yet.</p>
                                        </div>))) : (<div className="text-white text-center">
                                    <p className="text-2xl font-bold mb-2 tracking-tight">Ready to start?</p>
                                    <p className="text-white/50">Select your first lesson from the sidebar.</p>
                                </div>))}
                    </div>

                    {/* Interaction Tabs */}
                    <div className="space-y-6">
                        <tabs_1.Tabs defaultValue="overview" className="w-full">
                            <tabs_1.TabsList className="w-full justify-start border-b bg-transparent h-auto p-0 mb-8 flex-wrap gap-2">
                                <tabs_1.TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-4 font-bold text-sm uppercase tracking-widest transition-all">Overview</tabs_1.TabsTrigger>
                                <tabs_1.TabsTrigger value="qa" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-4 font-bold text-sm uppercase tracking-widest transition-all">Discussions</tabs_1.TabsTrigger>
                                <tabs_1.TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-4 font-bold text-sm uppercase tracking-widest transition-all">Reviews</tabs_1.TabsTrigger>
                                <tabs_1.TabsTrigger value="announcements" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-4 font-bold text-sm uppercase tracking-widest transition-all">Announcements</tabs_1.TabsTrigger>
                            </tabs_1.TabsList>

                            <tabs_1.TabsContent value="overview" className="space-y-8 outline-none animate-in fade-in duration-300">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-muted/20 p-6 rounded-2xl border border-white/5">
                                    <div className="space-y-1">
                                        <h1 className="text-3xl font-black tracking-tight">{activeLesson?.title || "Welcome Aboard!"}</h1>
                                        <p className="text-muted-foreground font-medium">Part of {course.title}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {!isLocked && activeLesson && (<button_1.Button variant={completedLessons.includes(activeLesson.id) ? "outline" : "default"} onClick={markAsComplete} className="h-12 px-8 rounded-full font-bold shadow-lg">
                                                {completedLessons.includes(activeLesson.id) ? "✓ Completed" : "Mark as Finished"}
                                            </button_1.Button>)}
                                        {isEnrolled &&
            course.sections.flatMap(s => s.lessons).length > 0 &&
            course.sections.flatMap(s => s.lessons).every(l => completedLessons.includes(l.id)) && (<button_1.Button variant="secondary" className="h-12 px-8 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white font-black shadow-xl animate-bounce" asChild>
                                                    <react_router_dom_1.Link to={`/certificate/${courseId}`}>🎓 Get Certificate</react_router_dom_1.Link>
                                                </button_1.Button>)}
                                    </div>
                                </div>

                                <div className="bg-muted/10 p-8 rounded-2xl border border-white/5 space-y-4">
                                    <h3 className="text-lg font-bold border-l-4 border-primary pl-4 uppercase tracking-tighter">Instructor Notes</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {activeLesson?.type === 'VIDEO' ? 'This session focuses on visual demonstration. Ensure you follow along with the source files provided.' : 'Deep dive into the theoretical framework of this module. Focus on the highlighted core concepts.'}
                                    </p>
                                </div>
                            </tabs_1.TabsContent>

                            <tabs_1.TabsContent value="qa" className="outline-none animate-in shadow-sm rounded-xl">
                                <div className="max-w-3xl">
                                    {activeLesson ? (<LessonQA_1.default lessonId={activeLesson.id}/>) : (<div className="text-center py-20 bg-muted/10 rounded-2xl border border-dashed border-white/10">
                                            <p className="text-muted-foreground font-medium">Select a dynamic lesson to start a discussion thread.</p>
                                        </div>)}
                                </div>
                            </tabs_1.TabsContent>

                            <tabs_1.TabsContent value="reviews" className="outline-none">
                                <div className="max-w-3xl">
                                    <CourseReviews_1.default courseId={course.id} isEnrolled={isEnrolled}/>
                                </div>
                            </tabs_1.TabsContent>

                            <tabs_1.TabsContent value="announcements" className="outline-none text-center py-20 bg-muted/10 rounded-2xl border border-dashed border-white/10">
                                <p className="text-muted-foreground font-medium italic">"Silence is gold. No announcements for now."</p>
                            </tabs_1.TabsContent>
                        </tabs_1.Tabs>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <CourseSidebar_1.default courseTitle={course.title} sections={course.sections} activeLessonId={activeLessonId} onSelectLesson={(id) => setActiveLessonId(id)} progress={completedLessons.reduce((acc, id) => ({ ...acc, [id]: true }), {})}/>
        </div>);
}
