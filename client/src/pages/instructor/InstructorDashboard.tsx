import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { api } from "@/services/api"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Course {
    id: string;
    title: string;
    thumbnail: string;
    description: string;
    price: number;
    published: boolean;
}

interface Analytics {
    totalCourses: number;
    totalStudents: number;
    totalRevenue: number;
}

export default function InstructorDashboard() {
    const [analytics, setAnalytics] = useState<Analytics>({ totalCourses: 0, totalStudents: 0, totalRevenue: 0 });
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [analyticsRes] = await Promise.all([
                    api.get('/analytics').catch(() => ({ data: { data: { stats: { totalCourses: 0, totalStudents: 0, totalRevenue: 0 } } } })),
                ]);

                setAnalytics(analyticsRes.data.data.stats);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
        fetchMyCourses();
    }, []);

    const fetchMyCourses = async () => {
        try {
            const res = await api.get('/courses/teaching');
            setCourses(res.data.data.courses);
        } catch (e) {
            console.error("Failed to fetch teaching courses", e);
        }
    }

    const togglePublish = async (courseId: string, currentStatus: boolean) => {
        try {
            await api.patch(`/courses/${courseId}`, { published: !currentStatus });
            setCourses(courses.map(c => c.id === courseId ? { ...c, published: !currentStatus } : c));
        } catch (error) {
            console.error("Failed to toggle publish status", error);
        }
    };

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="container py-10">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
                    <p className="text-muted-foreground">Monitor your performance and manage courses.</p>
                </div>
                <Button asChild>
                    <Link to="/instructor/courses/new">Create New Course</Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Lifetime Earnings</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalStudents}</div>
                        <p className="text-xs text-muted-foreground">Across all courses</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalCourses}</div>
                        <p className="text-xs text-muted-foreground">Published & Drafts</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Your Courses</h2>
                {courses.length === 0 ? (
                    <div className="rounded-md border p-12 text-center text-muted-foreground bg-muted/10 border-dashed">
                        <h3 className="text-lg font-medium mb-2">No courses yet</h3>
                        <p className="mb-4">Start sharing your knowledge today!</p>
                        <Button variant="outline" asChild>
                            <Link to="/instructor/courses/new">Create First Course</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <Card key={course.id} className="flex flex-col group overflow-hidden transition-all hover:shadow-lg">
                                <CardHeader className="pb-2">
                                    <div className="aspect-video w-full bg-muted rounded-md mb-2 overflow-hidden relative">
                                        {course.thumbnail ? (
                                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-muted-foreground">No Image</div>
                                        )}
                                        <div className="absolute top-2 right-2">
                                            <Badge variant={course.published ? "default" : "secondary"} className={course.published ? "bg-green-500" : "bg-yellow-500"}>
                                                {course.published ? "Live" : "Draft"}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardTitle className="line-clamp-1 text-lg">{course.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="text-sm font-black text-primary">${course.price}</div>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                                </CardContent>
                                <div className="p-4 pt-0 mt-auto flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1" asChild>
                                            <Link to={`/instructor/courses/${course.id}/edit`}>Manage</Link>
                                        </Button>
                                        <Button variant="secondary" className="flex-1" asChild>
                                            <Link to={`/instructor/courses/${course.id}/submissions`}>Submissions</Link>
                                        </Button>
                                    </div>
                                    <Button
                                        variant={course.published ? "ghost" : "default"}
                                        size="sm"
                                        className="w-full h-9 font-bold"
                                        onClick={() => togglePublish(course.id, course.published)}
                                    >
                                        {course.published ? "Set as Draft" : "Publish Course Now"}
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
