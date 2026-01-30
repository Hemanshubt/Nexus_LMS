"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InstructorDashboard;
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const react_router_dom_1 = require("react-router-dom");
const react_1 = require("react");
const api_1 = require("@/services/api");
const lucide_react_1 = require("lucide-react");
const badge_1 = require("@/components/ui/badge");
function InstructorDashboard() {
    const [analytics, setAnalytics] = (0, react_1.useState)({ totalCourses: 0, totalStudents: 0, totalRevenue: 0 });
    const [courses, setCourses] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        const fetchData = async () => {
            try {
                const [analyticsRes] = await Promise.all([
                    api_1.api.get('/analytics').catch(() => ({ data: { data: { stats: { totalCourses: 0, totalStudents: 0, totalRevenue: 0 } } } })),
                ]);
                setAnalytics(analyticsRes.data.data.stats);
            }
            catch (error) {
                console.error("Failed to fetch dashboard data", error);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchData();
        fetchMyCourses();
    }, []);
    const fetchMyCourses = async () => {
        try {
            const res = await api_1.api.get('/courses/teaching');
            setCourses(res.data.data.courses);
        }
        catch (e) {
            console.error("Failed to fetch teaching courses", e);
        }
    };
    const togglePublish = async (courseId, currentStatus) => {
        try {
            await api_1.api.patch(`/courses/${courseId}`, { published: !currentStatus });
            setCourses(courses.map(c => c.id === courseId ? { ...c, published: !currentStatus } : c));
        }
        catch (error) {
            console.error("Failed to toggle publish status", error);
        }
    };
    if (isLoading)
        return <div className="flex justify-center p-10"><lucide_react_1.Loader2 className="animate-spin"/></div>;
    return (<div className="container py-10">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
                    <p className="text-muted-foreground">Monitor your performance and manage courses.</p>
                </div>
                <button_1.Button asChild>
                    <react_router_dom_1.Link to="/instructor/courses/new">Create New Course</react_router_dom_1.Link>
                </button_1.Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-8">
                <card_1.Card>
                    <card_1.CardHeader className="pb-2">
                        <card_1.CardTitle className="text-sm font-medium">Total Revenue</card_1.CardTitle>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                        <div className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Lifetime Earnings</p>
                    </card_1.CardContent>
                </card_1.Card>
                <card_1.Card>
                    <card_1.CardHeader className="pb-2">
                        <card_1.CardTitle className="text-sm font-medium">Total Students</card_1.CardTitle>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                        <div className="text-2xl font-bold">{analytics.totalStudents}</div>
                        <p className="text-xs text-muted-foreground">Across all courses</p>
                    </card_1.CardContent>
                </card_1.Card>
                <card_1.Card>
                    <card_1.CardHeader className="pb-2">
                        <card_1.CardTitle className="text-sm font-medium">Active Courses</card_1.CardTitle>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                        <div className="text-2xl font-bold">{analytics.totalCourses}</div>
                        <p className="text-xs text-muted-foreground">Published & Drafts</p>
                    </card_1.CardContent>
                </card_1.Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Your Courses</h2>
                {courses.length === 0 ? (<div className="rounded-md border p-12 text-center text-muted-foreground bg-muted/10 border-dashed">
                        <h3 className="text-lg font-medium mb-2">No courses yet</h3>
                        <p className="mb-4">Start sharing your knowledge today!</p>
                        <button_1.Button variant="outline" asChild>
                            <react_router_dom_1.Link to="/instructor/courses/new">Create First Course</react_router_dom_1.Link>
                        </button_1.Button>
                    </div>) : (<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (<card_1.Card key={course.id} className="flex flex-col group overflow-hidden transition-all hover:shadow-lg">
                                <card_1.CardHeader className="pb-2">
                                    <div className="aspect-video w-full bg-muted rounded-md mb-2 overflow-hidden relative">
                                        {course.thumbnail ? (<img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform group-hover:scale-105"/>) : (<div className="w-full h-full bg-gray-200 flex items-center justify-center text-muted-foreground">No Image</div>)}
                                        <div className="absolute top-2 right-2">
                                            <badge_1.Badge variant={course.published ? "default" : "secondary"} className={course.published ? "bg-green-500" : "bg-yellow-500"}>
                                                {course.published ? "Live" : "Draft"}
                                            </badge_1.Badge>
                                        </div>
                                    </div>
                                    <card_1.CardTitle className="line-clamp-1 text-lg">{course.title}</card_1.CardTitle>
                                </card_1.CardHeader>
                                <card_1.CardContent className="flex-1">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="text-sm font-black text-primary">${course.price}</div>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                                </card_1.CardContent>
                                <div className="p-4 pt-0 mt-auto flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <button_1.Button variant="outline" className="flex-1" asChild>
                                            <react_router_dom_1.Link to={`/instructor/courses/${course.id}/edit`}>Manage</react_router_dom_1.Link>
                                        </button_1.Button>
                                        <button_1.Button variant="secondary" className="flex-1" asChild>
                                            <react_router_dom_1.Link to={`/instructor/courses/${course.id}/submissions`}>Submissions</react_router_dom_1.Link>
                                        </button_1.Button>
                                    </div>
                                    <button_1.Button variant={course.published ? "ghost" : "default"} size="sm" className="w-full h-9 font-bold" onClick={() => togglePublish(course.id, course.published)}>
                                        {course.published ? "Set as Draft" : "Publish Course Now"}
                                    </button_1.Button>
                                </div>
                            </card_1.Card>))}
                    </div>)}
            </div>
        </div>);
}
