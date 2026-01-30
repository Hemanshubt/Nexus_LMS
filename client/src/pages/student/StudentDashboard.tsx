import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { api } from "@/services/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Star, User, Clock, Trophy, TrendingUp, Users, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import CourseSearchFilters, { SearchFilters } from "@/components/course/CourseSearchFilters"
import WishlistButton from "@/components/common/WishlistButton"

interface Course {
    id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    price?: number;
    avgRating?: number;
    totalReviews?: number;
    enrollmentCount?: number;
    instructor?: {
        name: string;
        avatar?: string;
    };
    categories?: { name: string }[];
}

interface Enrollment {
    id: string;
    progress: number;
    completed: boolean;
    course: Course;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

const CATEGORIES = ["Web Development", "Mobile Development", "Data Science", "Design", "Business", "Marketing"];

export default function StudentDashboard() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [currentFilters, setCurrentFilters] = useState<SearchFilters | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coursesRes, enrollmentsRes] = await Promise.all([
                    api.get('/courses'),
                    api.get('/enrollments/my').catch(() => ({ data: { data: { enrollments: [] } } }))
                ]);

                if (coursesRes.data.data.courses) {
                    setCourses(coursesRes.data.data.courses);
                    setPagination(coursesRes.data.data.pagination);
                }
                if (enrollmentsRes.data.data.enrollments) {
                    setEnrollments(enrollmentsRes.data.data.enrollments);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSearch = async (filters: SearchFilters) => {
        setCurrentFilters(filters);
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.category !== 'All') params.append('category', filters.category);
            if (filters.sort) params.append('sort', filters.sort);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.free) params.append('free', 'true');

            const res = await api.get(`/courses?${params.toString()}`);
            setCourses(res.data.data.courses);
            setPagination(res.data.data.pagination);
        } catch (error) {
            console.error("Search failed", error);
        }
    };

    const loadMore = async () => {
        if (!pagination || pagination.page >= pagination.pages) return;

        try {
            const params = new URLSearchParams();
            params.append('page', String(pagination.page + 1));
            if (currentFilters) {
                if (currentFilters.search) params.append('search', currentFilters.search);
                if (currentFilters.category !== 'All') params.append('category', currentFilters.category);
                if (currentFilters.sort) params.append('sort', currentFilters.sort);
            }

            const res = await api.get(`/courses?${params.toString()}`);
            setCourses([...courses, ...res.data.data.courses]);
            setPagination(res.data.data.pagination);
        } catch (error) {
            console.error("Load more failed", error);
        }
    };

    if (isLoading) {
        return (
            <div className="container py-10">
                <div className="animate-pulse space-y-8">
                    <div className="h-10 w-64 bg-muted rounded" />
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-80 bg-muted rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const enrolledCourseIds = new Set(enrollments.map(e => e.course.id));
    const inProgress = enrollments.filter(e => !e.completed);
    const completed = enrollments.filter(e => e.completed);

    // Stats
    const totalProgress = inProgress.length > 0
        ? Math.round(inProgress.reduce((acc, e) => acc + (e.progress || 0), 0) / inProgress.length)
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
                <div className="container py-8 md:py-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                                Welcome Back! 👋
                            </h1>
                            <p className="text-muted-foreground mt-2 text-lg">
                                Continue your learning journey or explore new courses.
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-4">
                            <div className="bg-background rounded-xl p-4 border shadow-sm min-w-[120px]">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <BookOpen className="h-4 w-4" />
                                    <span>Enrolled</span>
                                </div>
                                <p className="text-2xl font-bold mt-1">{enrollments.length}</p>
                            </div>
                            <div className="bg-background rounded-xl p-4 border shadow-sm min-w-[120px]">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <Trophy className="h-4 w-4" />
                                    <span>Completed</span>
                                </div>
                                <p className="text-2xl font-bold mt-1">{completed.length}</p>
                            </div>
                            <div className="hidden md:block bg-background rounded-xl p-4 border shadow-sm min-w-[120px]">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <TrendingUp className="h-4 w-4" />
                                    <span>Avg Progress</span>
                                </div>
                                <p className="text-2xl font-bold mt-1">{totalProgress}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-8 space-y-8">
                <Tabs defaultValue="my-learning" className="space-y-8">
                    <TabsList className="bg-muted/50 p-1 h-auto">
                        <TabsTrigger value="my-learning" className="data-[state=active]:bg-background py-2.5 px-6">
                            My Learning
                        </TabsTrigger>
                        <TabsTrigger value="browse" className="data-[state=active]:bg-background py-2.5 px-6">
                            Browse Courses
                        </TabsTrigger>
                    </TabsList>

                    {/* MY LEARNING TAB */}
                    <TabsContent value="my-learning" className="space-y-8">
                        {/* Continue Learning Section */}
                        {inProgress.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-primary" />
                                        Continue Learning
                                    </h2>
                                    <Link to="/student/dashboard" className="text-sm text-primary hover:underline flex items-center gap-1">
                                        View All <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </div>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {inProgress.slice(0, 3).map((enrollment) => (
                                        <Card key={enrollment.id} className="group overflow-hidden border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                            <div className="aspect-video relative overflow-hidden bg-muted">
                                                {enrollment.course.thumbnail ? (
                                                    <img src={enrollment.course.thumbnail} alt={enrollment.course.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-primary/20 to-primary/5">
                                                        <BookOpen className="h-12 w-12 opacity-50" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4">
                                                    <div className="flex justify-between text-xs text-white font-medium mb-2">
                                                        <span>{Math.round(enrollment.progress || 0)}% Complete</span>
                                                    </div>
                                                    <Progress value={enrollment.progress || 0} className="h-2 bg-white/20" />
                                                </div>
                                            </div>
                                            <CardHeader className="p-4">
                                                <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                                                    {enrollment.course.title}
                                                </CardTitle>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <User className="h-3 w-3" />
                                                    <span>{enrollment.course.instructor?.name}</span>
                                                </div>
                                            </CardHeader>
                                            <CardFooter className="p-4 pt-0">
                                                <Button asChild className="w-full shadow-lg shadow-primary/20">
                                                    <Link to={`/learn/${enrollment.course.id}`}>
                                                        Continue Learning
                                                    </Link>
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Completed Section */}
                        {completed.length > 0 && (
                            <section>
                                <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                    Completed Courses
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    {completed.map((enrollment) => (
                                        <Card key={enrollment.id} className="group overflow-hidden hover:shadow-md transition-all">
                                            <div className="flex items-center gap-4 p-4">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                                                    {enrollment.course.thumbnail ? (
                                                        <img src={enrollment.course.thumbnail} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-green-100">
                                                            <Trophy className="h-6 w-6 text-green-600" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                                        {enrollment.course.title}
                                                    </h3>
                                                    <Link to={`/certificate/${enrollment.course.id}`} className="text-xs text-primary hover:underline mt-1 inline-block">
                                                        View Certificate →
                                                    </Link>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Empty State */}
                        {enrollments.length === 0 && (
                            <div className="text-center py-20 border rounded-2xl bg-gradient-to-b from-muted/30 to-background border-dashed">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                                    <BookOpen className="h-10 w-10 text-primary" />
                                </div>
                                <h3 className="text-2xl font-semibold mb-2">Start Your Learning Journey</h3>
                                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                    Explore our catalog of courses taught by industry experts and unlock your potential.
                                </p>
                                <Button size="lg" onClick={() => (document.querySelector('[data-value="browse"]') as HTMLElement)?.click()}>
                                    Explore Courses
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    {/* BROWSE CATALOG TAB */}
                    <TabsContent value="browse" className="space-y-6">
                        <CourseSearchFilters
                            onSearch={handleSearch}
                            categories={CATEGORIES}
                        />

                        {/* Results Count */}
                        {pagination && (
                            <div className="flex items-center justify-between">
                                <p className="text-muted-foreground">
                                    Showing <span className="font-medium text-foreground">{courses.length}</span> of{' '}
                                    <span className="font-medium text-foreground">{pagination.total}</span> courses
                                </p>
                            </div>
                        )}

                        {/* Course Grid */}
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {courses.length === 0 ? (
                                <div className="col-span-full py-20 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                                    <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                                </div>
                            ) : (
                                courses.map((course) => {
                                    const isEnrolled = enrolledCourseIds.has(course.id);
                                    return (
                                        <Card key={course.id} className="group flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                            <Link to={`/course/${course.id}`} className="block aspect-video relative overflow-hidden bg-muted">
                                                {course.thumbnail ? (
                                                    <img src={course.thumbnail} alt={course.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                                        <BookOpen className="h-12 w-12 text-primary/30" />
                                                    </div>
                                                )}
                                                {course.price === 0 && (
                                                    <Badge className="absolute top-3 left-3 bg-green-500 hover:bg-green-600 shadow-lg">FREE</Badge>
                                                )}
                                                <div className="absolute top-3 right-3">
                                                    <WishlistButton courseId={course.id} variant="icon" className="bg-background/80 backdrop-blur-sm shadow-md" />
                                                </div>
                                            </Link>
                                            <CardContent className="p-4 flex-1 space-y-3">
                                                <Link to={`/course/${course.id}`}>
                                                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                                                        {course.title}
                                                    </h3>
                                                </Link>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    {course.instructor?.avatar ? (
                                                        <img src={course.instructor.avatar} className="w-5 h-5 rounded-full" alt="" />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                                                            <User className="h-3 w-3" />
                                                        </div>
                                                    )}
                                                    <span className="truncate">{course.instructor?.name || "Instructor"}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <div className="flex items-center gap-1 text-yellow-500 font-medium">
                                                        <Star className="h-4 w-4 fill-current" />
                                                        <span>{course.avgRating?.toFixed(1) || "0.0"}</span>
                                                    </div>
                                                    <span className="text-muted-foreground">({course.totalReviews || 0})</span>
                                                    {course.enrollmentCount !== undefined && (
                                                        <div className="flex items-center gap-1 text-muted-foreground ml-auto">
                                                            <Users className="h-3 w-3" />
                                                            <span>{course.enrollmentCount}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                            <CardFooter className="p-4 pt-0 flex items-center justify-between gap-3">
                                                <div>
                                                    {course.price === 0 ? (
                                                        <span className="text-lg font-bold text-green-600">Free</span>
                                                    ) : (
                                                        <span className="text-xl font-bold">₹{course.price?.toLocaleString()}</span>
                                                    )}
                                                </div>
                                                {isEnrolled ? (
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link to={`/learn/${course.id}`}>Continue</Link>
                                                    </Button>
                                                ) : (
                                                    <Button asChild size="sm">
                                                        <Link to={`/course/${course.id}`}>View</Link>
                                                    </Button>
                                                )}
                                            </CardFooter>
                                        </Card>
                                    );
                                })
                            )}
                        </div>

                        {/* Load More */}
                        {pagination && pagination.page < pagination.pages && (
                            <div className="flex justify-center pt-6">
                                <Button variant="outline" size="lg" onClick={loadMore}>
                                    Load More Courses
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
