import CourseSidebar from "@/components/course/CourseSidebar";
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { loadRazorpay } from "@/lib/payment";
import QuizPlayer from "@/components/student/QuizPlayer";
import AssignmentPlayer from "@/components/student/AssignmentPlayer";
import CourseReviews from "@/components/course/CourseReviews";
import LessonQA from "@/components/student/LessonQA";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Lesson {
    id: string;
    title: string;
    videoUrl?: string;
    order: number;
    type?: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT';
    content?: string;
}

interface Section {
    id: string;
    title: string;
    order: number;
    lessons: Lesson[];
}

interface CourseData {
    id: string;
    title: string;
    price: number;
    sections: Section[];
}

export default function CoursePlayerPage() {
    const { courseId } = useParams();
    const [course, setCourse] = useState<CourseData | null>(null);
    const [activeLessonId, setActiveLessonId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [isBuying, setIsBuying] = useState(false);

    useEffect(() => {
        if (courseId) {
            fetchCourse();
        }
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            const cRes = await api.get(`/courses/${courseId}`);
            let isEnrolledVal = false;
            let completedIds: string[] = [];

            try {
                const sRes = await api.get(`/enrollments/status/${courseId}`);
                isEnrolledVal = sRes.data.data.isEnrolled;

                if (isEnrolledVal) {
                    const pRes = await api.get(`/progress/${courseId}`);
                    completedIds = pRes.data.data.completedLessonIds;
                }
            } catch (e) {
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
        } catch (error) {
            console.error("Failed to fetch player data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const markAsComplete = async () => {
        if (!activeLessonId) return;
        try {
            await api.post(`/progress/lessons/${activeLessonId}`, { isCompleted: true });
            if (!completedLessons.includes(activeLessonId)) {
                setCompletedLessons([...completedLessons, activeLessonId]);
            }
        } catch (error) {
            console.error("Failed to mark lesson complete", error);
        }
    };

    const handleBuyCourse = async () => {
        if (!course) return;
        setIsBuying(true);

        const loaded = await loadRazorpay();
        if (!loaded) {
            alert('Razorpay SDK failed to load. Are you online?');
            setIsBuying(false);
            return;
        }

        try {
            const orderRes = await api.post('/enrollments/checkout', { courseId: course.id });

            if (orderRes.data.data.isFree) {
                setIsEnrolled(true);
                alert("You have been enrolled for free! Enjoy the course.");
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
                handler: async function (response: any) {
                    try {
                        await api.post('/enrollments/verify', {
                            courseId: course.id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        setIsEnrolled(true);
                        alert("Enrollment Successful! Welcome aboard.");
                    } catch (verifyErr) {
                        console.error('Payment verification failed', verifyErr);
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                theme: { color: "#3399cc" }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("Purchase failed", err);
            alert("Something went wrong initializing the purchase.");
        } finally {
            setIsBuying(false);
        }
    };

    const activeLesson = course?.sections
        .flatMap(s => s.lessons)
        .find(l => l.id === activeLessonId);

    const isLocked = !isEnrolled && (course?.price ?? 0) > 0;

    if (isLoading) return <div className="p-10 text-center">Loading learning environment...</div>;
    if (!course) return <div className="p-10 text-center">Course not found.</div>;

    return (
        <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto bg-background p-6 custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Content Player Container */}
                    <div className="aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center relative shadow-2xl border border-white/5">
                        {isLocked ? (
                            <div className="absolute inset-0 z-10 bg-black/90 flex flex-col items-center justify-center text-center p-8 space-y-6 backdrop-blur-sm">
                                <div className="bg-primary/20 p-6 rounded-full animate-pulse">
                                    <Lock className="w-12 h-12 text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold text-white tracking-tight">Access Restricted</h2>
                                    <p className="text-white/60 max-w-sm mx-auto leading-relaxed">
                                        Unlock full lifetime access to this course and all future updates.
                                    </p>
                                </div>
                                <Button size="lg" onClick={handleBuyCourse} disabled={isBuying} className="h-14 px-10 text-lg font-bold">
                                    {isBuying ? "Processing..." : `Enroll Now • $${course.price}`}
                                </Button>
                            </div>
                        ) : (
                            activeLesson ? (
                                activeLesson.type === 'QUIZ' ? (
                                    <div className="w-full h-full bg-background text-foreground overflow-y-auto p-4">
                                        <QuizPlayer
                                            lessonId={activeLesson.id}
                                            onComplete={() => {
                                                if (!completedLessons.includes(activeLesson.id)) {
                                                    setCompletedLessons([...completedLessons, activeLesson.id]);
                                                }
                                            }}
                                        />
                                    </div>
                                ) : activeLesson.type === 'ASSIGNMENT' ? (
                                    <div className="w-full h-full bg-background text-foreground overflow-y-auto p-4">
                                        <AssignmentPlayer
                                            lessonId={activeLesson.id}
                                            onComplete={() => {
                                                if (!completedLessons.includes(activeLesson.id)) {
                                                    setCompletedLessons([...completedLessons, activeLesson.id]);
                                                }
                                            }}
                                        />
                                    </div>
                                ) : activeLesson.type === 'TEXT' ? (
                                    <div className="w-full h-full bg-background text-foreground overflow-y-auto p-12 transition-all duration-500">
                                        <div className="max-w-3xl mx-auto prose prose-invert font-serif leading-loose text-lg">
                                            {activeLesson.content || "No content available."}
                                        </div>
                                    </div>
                                ) : (
                                    activeLesson.videoUrl ? (
                                        <video
                                            key={activeLesson.videoUrl}
                                            controls
                                            className="w-full h-full object-contain"
                                            src={activeLesson.videoUrl}
                                            controlsList="nodownload"
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        <div className="text-white text-center space-y-4">
                                            <div className="text-primary text-5xl font-black">?</div>
                                            <p className="text-2xl font-bold">Incomplete Lesson</p>
                                            <p className="text-white/40">The instructor hasn't uploaded video for this yet.</p>
                                        </div>
                                    )
                                )
                            ) : (
                                <div className="text-white text-center">
                                    <p className="text-2xl font-bold mb-2 tracking-tight">Ready to start?</p>
                                    <p className="text-white/50">Select your first lesson from the sidebar.</p>
                                </div>
                            )
                        )}
                    </div>

                    {/* Interaction Tabs */}
                    <div className="space-y-6">
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="w-full justify-start border-b bg-transparent h-auto p-0 mb-8 flex-wrap gap-2">
                                <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-4 font-bold text-sm uppercase tracking-widest transition-all">Overview</TabsTrigger>
                                <TabsTrigger value="qa" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-4 font-bold text-sm uppercase tracking-widest transition-all">Discussions</TabsTrigger>
                                <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-4 font-bold text-sm uppercase tracking-widest transition-all">Reviews</TabsTrigger>
                                <TabsTrigger value="announcements" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-4 font-bold text-sm uppercase tracking-widest transition-all">Announcements</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-8 outline-none animate-in fade-in duration-300">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-muted/20 p-6 rounded-2xl border border-white/5">
                                    <div className="space-y-1">
                                        <h1 className="text-3xl font-black tracking-tight">{activeLesson?.title || "Welcome Aboard!"}</h1>
                                        <p className="text-muted-foreground font-medium">Part of {course.title}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {!isLocked && activeLesson && (
                                            <Button
                                                variant={completedLessons.includes(activeLesson.id) ? "outline" : "default"}
                                                onClick={markAsComplete}
                                                className="h-12 px-8 rounded-full font-bold shadow-lg"
                                            >
                                                {completedLessons.includes(activeLesson.id) ? "✓ Completed" : "Mark as Finished"}
                                            </Button>
                                        )}
                                        {isEnrolled &&
                                            course.sections.flatMap(s => s.lessons).length > 0 &&
                                            course.sections.flatMap(s => s.lessons).every(l => completedLessons.includes(l.id)) && (
                                                <Button variant="secondary" className="h-12 px-8 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white font-black shadow-xl animate-bounce" asChild>
                                                    <Link to={`/certificate/${courseId}`}>🎓 Get Certificate</Link>
                                                </Button>
                                            )
                                        }
                                    </div>
                                </div>

                                <div className="bg-muted/10 p-8 rounded-2xl border border-white/5 space-y-4">
                                    <h3 className="text-lg font-bold border-l-4 border-primary pl-4 uppercase tracking-tighter">Instructor Notes</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {activeLesson?.type === 'VIDEO' ? 'This session focuses on visual demonstration. Ensure you follow along with the source files provided.' : 'Deep dive into the theoretical framework of this module. Focus on the highlighted core concepts.'}
                                    </p>
                                </div>
                            </TabsContent>

                            <TabsContent value="qa" className="outline-none animate-in shadow-sm rounded-xl">
                                <div className="max-w-3xl">
                                    {activeLesson ? (
                                        <LessonQA lessonId={activeLesson.id} />
                                    ) : (
                                        <div className="text-center py-20 bg-muted/10 rounded-2xl border border-dashed border-white/10">
                                            <p className="text-muted-foreground font-medium">Select a dynamic lesson to start a discussion thread.</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="reviews" className="outline-none">
                                <div className="max-w-3xl">
                                    <CourseReviews courseId={course.id} isEnrolled={isEnrolled} />
                                </div>
                            </TabsContent>

                            <TabsContent value="announcements" className="outline-none text-center py-20 bg-muted/10 rounded-2xl border border-dashed border-white/10">
                                <p className="text-muted-foreground font-medium italic">"Silence is gold. No announcements for now."</p>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <CourseSidebar
                courseTitle={course.title}
                sections={course.sections}
                activeLessonId={activeLessonId}
                onSelectLesson={(id) => setActiveLessonId(id)}
                progress={completedLessons.reduce((acc, id) => ({ ...acc, [id]: true }), {})}
            />
        </div>
    );
}
