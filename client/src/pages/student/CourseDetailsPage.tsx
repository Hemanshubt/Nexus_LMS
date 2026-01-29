import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, PlayCircle, FileText, CheckCircle, Clock, Users, Globe, BookOpen, Star } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Lesson {
    id: string;
    title: string;
    type: string;
    duration?: number;
}

interface Section {
    id: string;
    title: string;
    lessons: Lesson[];
}

interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    price: number;
    instructor: {
        name: string;
        avatar?: string;
        bio?: string;
    };
    sections: Section[];
    avgRating?: number;
    totalReviews?: number;
    _count?: {
        enrollments: number;
    }
}

import CourseReviews from "@/components/course/CourseReviews";

export default function CourseDetailsPage() {
    const { courseId } = useParams();
    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        setIsLoading(true);
        try {
            const [courseRes, statusRes] = await Promise.all([
                api.get(`/courses/${courseId}`),
                api.get(`/enrollments/status/${courseId}`).catch(() => ({ data: { data: { isEnrolled: false } } }))
            ]);

            const isEnrolledVal = statusRes.data.data.isEnrolled;
            setCourse(courseRes.data.data.course);
            setIsEnrolled(isEnrolledVal);

            if (isEnrolledVal) {
                const progressRes = await api.get(`/progress/${courseId}`);
                setCompletedLessons(progressRes.data.data.completedLessonIds);
            }
        } catch (error) {
            console.error("Failed to fetch course details", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (!course) return <div className="p-10 text-center">Course not found.</div>;

    const totalLessons = course.sections.reduce((acc, section) => acc + section.lessons.length, 0);

    return (
        <div className="min-h-screen bg-background">
            {/* Dark Top Banner */}
            <div className="bg-[#1c1d1f] text-white py-12 md:py-16">
                <div className="container grid gap-8 lg:grid-cols-[1fr,350px]">
                    <div className="space-y-6">
                        <h1 className="text-3xl md:text-4xl font-bold leading-tight">{course.title}</h1>
                        <p className="text-lg text-gray-300 max-w-3xl line-clamp-3">
                            {course.description || "Master the foundations and advanced techniques of this subject with our comprehensive guide."}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm items-center">
                            <div className="flex items-center gap-1 text-yellow-400">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="font-bold text-lg">{course.avgRating?.toFixed(1) || "0.0"}</span>
                                <span className="text-gray-400 underline cursor-pointer">({course.totalReviews || 0} ratings)</span>
                            </div>
                            <div className="text-gray-400">|</div>
                            <div className="text-gray-300">
                                52,142 students
                            </div>
                            <div className="text-gray-400">|</div>
                            <div className="text-gray-300">
                                Created by <span className="text-primary-foreground underline font-medium">{course.instructor.name}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>12.5 total hours</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-gray-400" />
                                <span>English</span>
                            </div>
                        </div>
                    </div>

                    {/* Floating Side Card (Desktop) */}
                    <div className="hidden lg:block">
                        <Card className="sticky top-24 shadow-2xl border-none overflow-hidden">
                            <div className="aspect-video relative group overflow-hidden bg-black">
                                {course.thumbnail ? (
                                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/50">Preview Course</div>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <PlayCircle className="w-16 h-16 text-white" />
                                </div>
                            </div>
                            <CardContent className="p-6 space-y-6">
                                <div className="text-3xl font-bold">${course.price}</div>
                                <div className="space-y-3">
                                    {isEnrolled ? (
                                        <Button className="w-full py-6 text-lg" asChild>
                                            <Link to={`/learn/${course.id}`}>Go to Course</Link>
                                        </Button>
                                    ) : (
                                        <>
                                            <Button className="w-full py-6 text-lg" asChild>
                                                <Link to={`/learn/${course.id}`}>Buy Now</Link>
                                            </Button>
                                            <Button variant="outline" className="w-full py-6">Add to Cart</Button>
                                        </>
                                    )}
                                </div>
                                <div className="text-center text-xs text-muted-foreground">30-Day Money-Back Guarantee</div>
                                <div className="space-y-2">
                                    <div className="font-bold text-sm">This course includes:</div>
                                    <ul className="text-sm space-y-2 text-muted-foreground">
                                        <li className="flex items-center gap-3"><Clock className="w-4 h-4" /> Full lifetime access</li>
                                        <li className="flex items-center gap-3"><Users className="w-4 h-4" /> Access on mobile and TV</li>
                                        <li className="flex items-center gap-3"><BookOpen className="w-4 h-4" /> Assignments</li>
                                        <li className="flex items-center gap-3"><CheckCircle className="w-4 h-4" /> Certificate of completion</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Main Content Sections */}
            <div className="container py-12 lg:grid lg:grid-cols-[1fr,350px] gap-8">
                <div className="space-y-12">
                    {/* What you'll learn */}
                    <section className="border p-6 rounded-lg">
                        <h2 className="text-2xl font-bold mb-4">What you'll learn</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                "Master the core concepts of the subject",
                                "Implement real-world projects from scratch",
                                "Learn best practices and common pitfalls",
                                "Prepare for industry-standard certifications",
                                "Optimize performance and security",
                                "Understand the latest trends and updates"
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Course Content (Syllabus) */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Course content</h2>
                        <div className="flex justify-between text-sm text-muted-foreground mb-4">
                            <span>{course.sections.length} sections • {totalLessons} lectures</span>
                        </div>

                        <Accordion type="single" collapsible className="border rounded-lg overflow-hidden">
                            {course.sections.map((section, idx) => (
                                <AccordionItem key={section.id} value={section.id} className={idx === course.sections.length - 1 ? "border-b-0" : ""}>
                                    <AccordionTrigger className="hover:no-underline bg-muted/20 px-4 py-4">
                                        <div className="flex items-center gap-4 text-left">
                                            <span className="font-bold text-base">{section.title}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="bg-background">
                                        <div className="divide-y">
                                            {section.lessons.map(lesson => {
                                                const isCompleted = completedLessons.includes(lesson.id);
                                                return (
                                                    <div key={lesson.id} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/30 transition-colors group">
                                                        <div className="shrink-0">
                                                            {isCompleted ? (
                                                                <CheckCircle className="w-4 h-4 text-green-500 fill-green-500/10" />
                                                            ) : (
                                                                <>
                                                                    {lesson.type === 'VIDEO' && <PlayCircle className="w-4 h-4 text-primary" />}
                                                                    {lesson.type === 'TEXT' && <FileText className="w-4 h-4 text-muted-foreground" />}
                                                                    {lesson.type === 'QUIZ' && <CheckCircle className="w-4 h-4 text-orange-500" />}
                                                                    {lesson.type === 'ASSIGNMENT' && <BookOpen className="w-4 h-4 text-blue-500" />}
                                                                </>
                                                            )}
                                                        </div>
                                                        <span className={cn(
                                                            "text-sm flex-1 transition-colors",
                                                            isCompleted ? "text-muted-foreground line-through decoration-muted-foreground/30" : "text-foreground group-hover:text-primary"
                                                        )}>
                                                            {lesson.title}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">05:20</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </section>

                    {/* Instructor Section */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6">Instructor</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-muted overflow-hidden border">
                                    {course.instructor.avatar ? (
                                        <img src={course.instructor.avatar} alt={course.instructor.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-muted-foreground">
                                            {course.instructor.name[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Link to={`/instructor/${course.instructor.name}`} className="text-xl font-bold text-primary hover:underline">
                                        {course.instructor.name}
                                    </Link>
                                    <p className="text-sm text-muted-foreground font-medium">Expert Instructor & Content Creator</p>
                                    <div className="flex gap-4 text-sm font-bold pt-2">
                                        <div className="flex items-center gap-1"><Star className="w-4 h-4" /> 4.9 Rating</div>
                                        <div className="flex items-center gap-1"><Users className="w-4 h-4" /> 120k Students</div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-sm leading-relaxed text-muted-foreground">
                                {course.instructor.bio || "Passionate about teaching and empowering students to reach their full potential. With years of industry experience, I bring practical knowledge to every lesson."}
                            </div>
                        </div>
                    </section>

                    {/* Reviews Section */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 text-foreground">Student Feedback</h2>
                        <CourseReviews courseId={course.id} isEnrolled={isEnrolled} />
                    </section>
                </div>

                {/* Mobile Buy Button Placeholder (Floating) */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-50 flex items-center justify-between shadow-lg">
                    <div className="text-2xl font-bold">${course.price}</div>
                    <Button size="lg" className="px-8" asChild>
                        <Link to={`/learn/${course.id}`}>{isEnrolled ? "Go to Course" : "Buy Now"}</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
