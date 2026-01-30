"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StudentDashboard;
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const react_router_dom_1 = require("react-router-dom");
const react_1 = require("react");
const api_1 = require("@/services/api");
const tabs_1 = require("@/components/ui/tabs");
const progress_1 = require("@/components/ui/progress");
const lucide_react_1 = require("lucide-react");
const badge_1 = require("@/components/ui/badge");
const CourseSearchFilters_1 = __importDefault(require("@/components/course/CourseSearchFilters"));
const WishlistButton_1 = __importDefault(require("@/components/common/WishlistButton"));
const CATEGORIES = ["Web Development", "Mobile Development", "Data Science", "Design", "Business", "Marketing"];
function StudentDashboard() {
    const [courses, setCourses] = (0, react_1.useState)([]);
    const [enrollments, setEnrollments] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [pagination, setPagination] = (0, react_1.useState)(null);
    const [currentFilters, setCurrentFilters] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const fetchData = async () => {
            try {
                const [coursesRes, enrollmentsRes] = await Promise.all([
                    api_1.api.get('/courses'),
                    api_1.api.get('/enrollments/my').catch(() => ({ data: { data: { enrollments: [] } } }))
                ]);
                if (coursesRes.data.data.courses) {
                    setCourses(coursesRes.data.data.courses);
                    setPagination(coursesRes.data.data.pagination);
                }
                if (enrollmentsRes.data.data.enrollments) {
                    setEnrollments(enrollmentsRes.data.data.enrollments);
                }
            }
            catch (error) {
                console.error("Failed to fetch dashboard data", error);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);
    const handleSearch = async (filters) => {
        setCurrentFilters(filters);
        try {
            const params = new URLSearchParams();
            if (filters.search)
                params.append('search', filters.search);
            if (filters.category !== 'All')
                params.append('category', filters.category);
            if (filters.sort)
                params.append('sort', filters.sort);
            if (filters.minPrice)
                params.append('minPrice', filters.minPrice);
            if (filters.maxPrice)
                params.append('maxPrice', filters.maxPrice);
            if (filters.free)
                params.append('free', 'true');
            const res = await api_1.api.get(`/courses?${params.toString()}`);
            setCourses(res.data.data.courses);
            setPagination(res.data.data.pagination);
        }
        catch (error) {
            console.error("Search failed", error);
        }
    };
    const loadMore = async () => {
        if (!pagination || pagination.page >= pagination.pages)
            return;
        try {
            const params = new URLSearchParams();
            params.append('page', String(pagination.page + 1));
            if (currentFilters) {
                if (currentFilters.search)
                    params.append('search', currentFilters.search);
                if (currentFilters.category !== 'All')
                    params.append('category', currentFilters.category);
                if (currentFilters.sort)
                    params.append('sort', currentFilters.sort);
            }
            const res = await api_1.api.get(`/courses?${params.toString()}`);
            setCourses([...courses, ...res.data.data.courses]);
            setPagination(res.data.data.pagination);
        }
        catch (error) {
            console.error("Load more failed", error);
        }
    };
    if (isLoading) {
        return (<div className="container py-10">
                <div className="animate-pulse space-y-8">
                    <div className="h-10 w-64 bg-muted rounded"/>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map(i => (<div key={i} className="h-80 bg-muted rounded-xl"/>))}
                    </div>
                </div>
            </div>);
    }
    const enrolledCourseIds = new Set(enrollments.map(e => e.course.id));
    const inProgress = enrollments.filter(e => !e.completed);
    const completed = enrollments.filter(e => e.completed);
    // Stats
    const totalProgress = inProgress.length > 0
        ? Math.round(inProgress.reduce((acc, e) => acc + (e.progress || 0), 0) / inProgress.length)
        : 0;
    return (<div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
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
                                    <lucide_react_1.BookOpen className="h-4 w-4"/>
                                    <span>Enrolled</span>
                                </div>
                                <p className="text-2xl font-bold mt-1">{enrollments.length}</p>
                            </div>
                            <div className="bg-background rounded-xl p-4 border shadow-sm min-w-[120px]">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <lucide_react_1.Trophy className="h-4 w-4"/>
                                    <span>Completed</span>
                                </div>
                                <p className="text-2xl font-bold mt-1">{completed.length}</p>
                            </div>
                            <div className="hidden md:block bg-background rounded-xl p-4 border shadow-sm min-w-[120px]">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <lucide_react_1.TrendingUp className="h-4 w-4"/>
                                    <span>Avg Progress</span>
                                </div>
                                <p className="text-2xl font-bold mt-1">{totalProgress}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-8 space-y-8">
                <tabs_1.Tabs defaultValue="my-learning" className="space-y-8">
                    <tabs_1.TabsList className="bg-muted/50 p-1 h-auto">
                        <tabs_1.TabsTrigger value="my-learning" className="data-[state=active]:bg-background py-2.5 px-6">
                            My Learning
                        </tabs_1.TabsTrigger>
                        <tabs_1.TabsTrigger value="browse" className="data-[state=active]:bg-background py-2.5 px-6">
                            Browse Courses
                        </tabs_1.TabsTrigger>
                    </tabs_1.TabsList>

                    {/* MY LEARNING TAB */}
                    <tabs_1.TabsContent value="my-learning" className="space-y-8">
                        {/* Continue Learning Section */}
                        {inProgress.length > 0 && (<section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                        <lucide_react_1.Clock className="h-5 w-5 text-primary"/>
                                        Continue Learning
                                    </h2>
                                    <react_router_dom_1.Link to="/student/dashboard" className="text-sm text-primary hover:underline flex items-center gap-1">
                                        View All <lucide_react_1.ChevronRight className="h-4 w-4"/>
                                    </react_router_dom_1.Link>
                                </div>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {inProgress.slice(0, 3).map((enrollment) => (<card_1.Card key={enrollment.id} className="group overflow-hidden border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                            <div className="aspect-video relative overflow-hidden bg-muted">
                                                {enrollment.course.thumbnail ? (<img src={enrollment.course.thumbnail} alt={enrollment.course.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"/>) : (<div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-primary/20 to-primary/5">
                                                        <lucide_react_1.BookOpen className="h-12 w-12 opacity-50"/>
                                                    </div>)}
                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4">
                                                    <div className="flex justify-between text-xs text-white font-medium mb-2">
                                                        <span>{Math.round(enrollment.progress || 0)}% Complete</span>
                                                    </div>
                                                    <progress_1.Progress value={enrollment.progress || 0} className="h-2 bg-white/20"/>
                                                </div>
                                            </div>
                                            <card_1.CardHeader className="p-4">
                                                <card_1.CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                                                    {enrollment.course.title}
                                                </card_1.CardTitle>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <lucide_react_1.User className="h-3 w-3"/>
                                                    <span>{enrollment.course.instructor?.name}</span>
                                                </div>
                                            </card_1.CardHeader>
                                            <card_1.CardFooter className="p-4 pt-0">
                                                <button_1.Button asChild className="w-full shadow-lg shadow-primary/20">
                                                    <react_router_dom_1.Link to={`/learn/${enrollment.course.id}`}>
                                                        Continue Learning
                                                    </react_router_dom_1.Link>
                                                </button_1.Button>
                                            </card_1.CardFooter>
                                        </card_1.Card>))}
                                </div>
                            </section>)}

                        {/* Completed Section */}
                        {completed.length > 0 && (<section>
                                <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                                    <lucide_react_1.Trophy className="h-5 w-5 text-yellow-500"/>
                                    Completed Courses
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    {completed.map((enrollment) => (<card_1.Card key={enrollment.id} className="group overflow-hidden hover:shadow-md transition-all">
                                            <div className="flex items-center gap-4 p-4">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                                                    {enrollment.course.thumbnail ? (<img src={enrollment.course.thumbnail} alt="" className="w-full h-full object-cover"/>) : (<div className="w-full h-full flex items-center justify-center bg-green-100">
                                                            <lucide_react_1.Trophy className="h-6 w-6 text-green-600"/>
                                                        </div>)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                                        {enrollment.course.title}
                                                    </h3>
                                                    <react_router_dom_1.Link to={`/certificate/${enrollment.course.id}`} className="text-xs text-primary hover:underline mt-1 inline-block">
                                                        View Certificate →
                                                    </react_router_dom_1.Link>
                                                </div>
                                            </div>
                                        </card_1.Card>))}
                                </div>
                            </section>)}

                        {/* Empty State */}
                        {enrollments.length === 0 && (<div className="text-center py-20 border rounded-2xl bg-gradient-to-b from-muted/30 to-background border-dashed">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                                    <lucide_react_1.BookOpen className="h-10 w-10 text-primary"/>
                                </div>
                                <h3 className="text-2xl font-semibold mb-2">Start Your Learning Journey</h3>
                                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                    Explore our catalog of courses taught by industry experts and unlock your potential.
                                </p>
                                <button_1.Button size="lg" onClick={() => document.querySelector('[data-value="browse"]')?.click()}>
                                    Explore Courses
                                </button_1.Button>
                            </div>)}
                    </tabs_1.TabsContent>

                    {/* BROWSE CATALOG TAB */}
                    <tabs_1.TabsContent value="browse" className="space-y-6">
                        <CourseSearchFilters_1.default onSearch={handleSearch} categories={CATEGORIES}/>

                        {/* Results Count */}
                        {pagination && (<div className="flex items-center justify-between">
                                <p className="text-muted-foreground">
                                    Showing <span className="font-medium text-foreground">{courses.length}</span> of{' '}
                                    <span className="font-medium text-foreground">{pagination.total}</span> courses
                                </p>
                            </div>)}

                        {/* Course Grid */}
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {courses.length === 0 ? (<div className="col-span-full py-20 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                        <lucide_react_1.BookOpen className="h-8 w-8 text-muted-foreground"/>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                                    <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                                </div>) : (courses.map((course) => {
            const isEnrolled = enrolledCourseIds.has(course.id);
            return (<card_1.Card key={course.id} className="group flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                            <react_router_dom_1.Link to={`/course/${course.id}`} className="block aspect-video relative overflow-hidden bg-muted">
                                                {course.thumbnail ? (<img src={course.thumbnail} alt={course.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"/>) : (<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                                        <lucide_react_1.BookOpen className="h-12 w-12 text-primary/30"/>
                                                    </div>)}
                                                {course.price === 0 && (<badge_1.Badge className="absolute top-3 left-3 bg-green-500 hover:bg-green-600 shadow-lg">FREE</badge_1.Badge>)}
                                                <div className="absolute top-3 right-3">
                                                    <WishlistButton_1.default courseId={course.id} variant="icon" className="bg-background/80 backdrop-blur-sm shadow-md"/>
                                                </div>
                                            </react_router_dom_1.Link>
                                            <card_1.CardContent className="p-4 flex-1 space-y-3">
                                                <react_router_dom_1.Link to={`/course/${course.id}`}>
                                                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                                                        {course.title}
                                                    </h3>
                                                </react_router_dom_1.Link>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    {course.instructor?.avatar ? (<img src={course.instructor.avatar} className="w-5 h-5 rounded-full" alt=""/>) : (<div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                                                            <lucide_react_1.User className="h-3 w-3"/>
                                                        </div>)}
                                                    <span className="truncate">{course.instructor?.name || "Instructor"}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <div className="flex items-center gap-1 text-yellow-500 font-medium">
                                                        <lucide_react_1.Star className="h-4 w-4 fill-current"/>
                                                        <span>{course.avgRating?.toFixed(1) || "0.0"}</span>
                                                    </div>
                                                    <span className="text-muted-foreground">({course.totalReviews || 0})</span>
                                                    {course.enrollmentCount !== undefined && (<div className="flex items-center gap-1 text-muted-foreground ml-auto">
                                                            <lucide_react_1.Users className="h-3 w-3"/>
                                                            <span>{course.enrollmentCount}</span>
                                                        </div>)}
                                                </div>
                                            </card_1.CardContent>
                                            <card_1.CardFooter className="p-4 pt-0 flex items-center justify-between gap-3">
                                                <div>
                                                    {course.price === 0 ? (<span className="text-lg font-bold text-green-600">Free</span>) : (<span className="text-xl font-bold">₹{course.price?.toLocaleString()}</span>)}
                                                </div>
                                                {isEnrolled ? (<button_1.Button asChild variant="outline" size="sm">
                                                        <react_router_dom_1.Link to={`/learn/${course.id}`}>Continue</react_router_dom_1.Link>
                                                    </button_1.Button>) : (<button_1.Button asChild size="sm">
                                                        <react_router_dom_1.Link to={`/course/${course.id}`}>View</react_router_dom_1.Link>
                                                    </button_1.Button>)}
                                            </card_1.CardFooter>
                                        </card_1.Card>);
        }))}
                        </div>

                        {/* Load More */}
                        {pagination && pagination.page < pagination.pages && (<div className="flex justify-center pt-6">
                                <button_1.Button variant="outline" size="lg" onClick={loadMore}>
                                    Load More Courses
                                </button_1.Button>
                            </div>)}
                    </tabs_1.TabsContent>
                </tabs_1.Tabs>
            </div>
        </div>);
}
