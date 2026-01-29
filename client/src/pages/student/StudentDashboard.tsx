import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { api } from "@/services/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Search, Filter, BookOpen, Star, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Course {
    id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    price?: number;
    avgRating?: number;
    totalReviews?: number;
    instructor?: {
        name: string;
    };
    categories?: { name: string }[];
}

interface Enrollment {
    id: string;
    progress: number;
    completed: boolean;
    course: Course;
}

const CATEGORIES = ["All", "Web Development", "Mobile Dev", "Design", "Business", "Marketing", "Data Science"];

export default function StudentDashboard() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Initial load: fetch everything
                const [coursesRes, enrollmentsRes] = await Promise.all([
                    api.get('/courses'),
                    api.get('/enrollments/my').catch(() => ({ data: { data: { enrollments: [] } } }))
                ]);

                if (coursesRes.data.data.courses) {
                    setCourses(coursesRes.data.data.courses);
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

    // Filtered search/category effect
    useEffect(() => {
        const fetchFilteredCourses = async () => {
            try {
                const params = new URLSearchParams();
                if (searchQuery) params.append('search', searchQuery);
                if (selectedCategory !== "All") params.append('category', selectedCategory);

                const res = await api.get(`/courses?${params.toString()}`);
                setCourses(res.data.data.courses);
            } catch (error) {
                console.error("Filtering failed", error);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchFilteredCourses();
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchQuery, selectedCategory]);

    if (isLoading) return <div className="p-10 text-center">Loading your dashboard...</div>;

    const enrolledCourseIds = new Set(enrollments.map(e => e.course.id));

    return (
        <div className="container py-10 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome Back!</h1>
                    <p className="text-muted-foreground">Continue where you left off or explore new horizons.</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search courses..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Tabs defaultValue="my-learning" className="space-y-8">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="my-learning" className="data-[state=active]:bg-background">My Learning</TabsTrigger>
                    <TabsTrigger value="browse" className="data-[state=active]:bg-background">Browse Catalog</TabsTrigger>
                </TabsList>

                <TabsContent value="my-learning" className="space-y-6">
                    {enrollments.length === 0 ? (
                        <div className="text-center py-20 border rounded-2xl bg-muted/20 border-dashed">
                            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Ready to start?</h3>
                            <p className="text-muted-foreground mb-6">Explore our catalog and pick your first course.</p>
                            <Button onClick={() => (document.querySelector('[data-value="browse"]') as HTMLElement)?.click()}>
                                Explore Courses
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {enrollments.map((enrollment) => (
                                <Card key={enrollment.id} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all">
                                    <div className="aspect-video relative overflow-hidden bg-muted">
                                        {enrollment.course.thumbnail ? (
                                            <img src={enrollment.course.thumbnail} alt={enrollment.course.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">Learning...</div>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                            <div className="flex justify-between text-xs text-white font-medium mb-1">
                                                <span>Progress</span>
                                                <span>{Math.round(enrollment.progress || 0)}%</span>
                                            </div>
                                            <Progress value={enrollment.progress || 0} className="h-1.5 bg-white/20" />
                                        </div>
                                    </div>
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">{enrollment.course.title}</CardTitle>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <User className="h-3 w-3" />
                                            <span>{enrollment.course.instructor?.name}</span>
                                        </div>
                                    </CardHeader>
                                    <CardFooter className="p-4 pt-0">
                                        <Button asChild className="w-full">
                                            <Link to={`/learn/${enrollment.course.id}`}>Continue</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="browse" className="space-y-8">
                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <Filter className="h-4 w-4 text-muted-foreground mr-2" />
                        {CATEGORIES.map((cat) => (
                            <Badge
                                key={cat}
                                variant={selectedCategory === cat ? "default" : "secondary"}
                                className="cursor-pointer px-4 py-1.5 text-sm font-medium transition-all"
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </Badge>
                        ))}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {courses.length === 0 ? (
                            <div className="col-span-full py-20 text-center">
                                <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                                <h3 className="text-xl font-semibold opacity-50">No courses match your search.</h3>
                            </div>
                        ) : (
                            courses.map((course) => {
                                const isEnrolled = enrolledCourseIds.has(course.id);
                                return (
                                    <Card key={course.id} className="group flex flex-col overflow-hidden border-none shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                                        <Link to={`/course/${course.id}`} className="block aspect-video relative overflow-hidden bg-muted">
                                            {course.thumbnail ? (
                                                <img src={course.thumbnail} alt={course.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Preview</div>
                                            )}
                                            {course.price === 0 && (
                                                <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">FREE</Badge>
                                            )}
                                        </Link>
                                        <CardHeader className="p-5 flex-1 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-lg line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                                                    <Link to={`/course/${course.id}`}>{course.title}</Link>
                                                </CardTitle>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>{course.instructor?.name || "Instructor"}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold pt-1">
                                                <Star className="h-3 w-3 fill-current" />
                                                <span>{course.avgRating?.toFixed(1) || "0.0"}</span>
                                                <span className="text-muted-foreground font-normal">({course.totalReviews || 0})</span>
                                            </div>
                                        </CardHeader>
                                        <CardFooter className="p-5 pt-0 flex flex-col gap-3">
                                            <div className="flex justify-between items-center w-full">
                                                <span className="text-xl font-bold">${course.price}</span>
                                                {isEnrolled ? (
                                                    <Badge variant="outline" className="text-primary border-primary">Enrolled</Badge>
                                                ) : null}
                                            </div>
                                            <Button asChild variant={isEnrolled ? "outline" : "default"} className="w-full shadow-lg shadow-primary/10">
                                                <Link to={isEnrolled ? `/learn/${course.id}` : `/course/${course.id}`}>
                                                    {isEnrolled ? "Go to Course" : "View Details"}
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
