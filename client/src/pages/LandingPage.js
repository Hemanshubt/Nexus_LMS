"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LandingPage;
const button_1 = require("@/components/ui/button");
const react_router_dom_1 = require("react-router-dom");
const react_1 = require("react");
const api_1 = require("@/services/api");
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
function LandingPage() {
    const [courses, setCourses] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        api_1.api.get('/courses?limit=3').then(res => {
            setCourses(res.data.data.courses.slice(0, 3));
        }).catch(() => { });
    }, []);
    return (<div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-background py-20 lg:py-32">
                <div className="container relative z-10 flex flex-col items-center gap-8 text-center">
                    <div className="inline-flex animate-bounce-slow items-center rounded-full border bg-muted/50 backdrop-blur-sm px-4 py-1.5 text-sm font-medium">
                        <lucide_react_1.Zap className="mr-2 h-4 w-4 text-primary fill-primary"/>
                        <span>Empowering thousands of creators weekly</span>
                    </div>
                    <h1 className="max-w-[50rem] font-black text-4xl sm:text-5xl md:text-6xl lg:text-8xl tracking-tighter leading-none mb-4">
                        Master the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-blue-500 animate-gradient">Craft</span> of the Future
                    </h1>
                    <p className="max-w-[42rem] leading-relaxed text-muted-foreground sm:text-2xl font-medium tracking-tight">
                        A premium platform built for deep learning. Coding, design, and business taught by masters of the industry.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
                        <react_router_dom_1.Link to="/register">
                            <button_1.Button size="lg" className="h-16 px-10 text-xl font-bold rounded-2xl shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                Start Your Odyssey
                            </button_1.Button>
                        </react_router_dom_1.Link>
                        <react_router_dom_1.Link to="/courses">
                            <button_1.Button size="lg" variant="outline" className="h-16 px-10 text-xl font-bold rounded-2xl border-2 hover:bg-muted transition-all">
                                Exploration Path
                            </button_1.Button>
                        </react_router_dom_1.Link>
                    </div>

                    {/* Social Proof Stats */}
                    <div className="mt-20 flex flex-wrap justify-center gap-12 md:gap-24 opacity-80">
                        <div className="text-center group cursor-default">
                            <h3 className="text-4xl font-black tracking-tighter group-hover:text-primary transition-colors">150+</h3>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">Modules</p>
                        </div>
                        <div className="text-center group cursor-default">
                            <h3 className="text-4xl font-black tracking-tighter group-hover:text-primary transition-colors">20k+</h3>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">Students</p>
                        </div>
                        <div className="text-center group cursor-default">
                            <h3 className="text-4xl font-black tracking-tighter group-hover:text-primary transition-colors">4.9/5</h3>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">Reviews</p>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-1/2 -z-10 h-[50rem] w-[50rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px] dark:bg-primary/5"/>
                <div className="absolute -top-24 right-0 -z-10 h-[30rem] w-[30rem] bg-purple-500/10 blur-[100px] dark:bg-purple-500/5"/>
                <div className="absolute -bottom-24 -left-24 -z-10 h-[30rem] w-[30rem] bg-blue-500/10 blur-[100px] dark:bg-blue-500/5"/>
            </section>

            {/* Features Section */}
            <section className="bg-muted/30 py-24">
                <div className="container space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">Why nexus?</h2>
                        <p className="mx-auto max-w-[40rem] text-muted-foreground">We provide a premium learning experience designed for modern professionals.</p>
                    </div>
                    <div className="grid gap-8 md:grid-cols-3">
                        <card_1.Card className="border-none bg-transparent shadow-none text-center space-y-4">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <lucide_react_1.Users className="h-8 w-8"/>
                            </div>
                            <h3 className="text-xl font-bold">Community Led</h3>
                            <p className="text-muted-foreground">Learn alongside thousands of peers in our active student community.</p>
                        </card_1.Card>
                        <card_1.Card className="border-none bg-transparent shadow-none text-center space-y-4">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <lucide_react_1.Award className="h-8 w-8"/>
                            </div>
                            <h3 className="text-xl font-bold">Industry Recognized</h3>
                            <p className="text-muted-foreground">Earn certificates that are verified and ready for your LinkedIn profile.</p>
                        </card_1.Card>
                        <card_1.Card className="border-none bg-transparent shadow-none text-center space-y-4">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <lucide_react_1.ShieldCheck className="h-8 w-8"/>
                            </div>
                            <h3 className="text-xl font-bold">Verified Skills</h3>
                            <p className="text-muted-foreground">Hands-on assignments and quizzes ensure you actually master the material.</p>
                        </card_1.Card>
                    </div>
                </div>
            </section>

            {/* Featured Courses */}
            <section className="py-24">
                <div className="container space-y-12">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold sm:text-4xl">Featured Courses</h2>
                            <p className="text-muted-foreground">Handpicked selections from our most popular categories.</p>
                        </div>
                        <button_1.Button variant="ghost" asChild>
                            <react_router_dom_1.Link to="/courses">View all courses &rarr;</react_router_dom_1.Link>
                        </button_1.Button>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {courses.length === 0 ? (Array(3).fill(0).map((_, i) => (<card_1.Card key={i} className="animate-pulse flex flex-col h-[400px]">
                                    <div className="aspect-video bg-muted rounded-t-lg"/>
                                    <div className="p-6 space-y-4">
                                        <div className="h-6 w-2/3 bg-muted rounded"/>
                                        <div className="h-20 w-full bg-muted rounded"/>
                                    </div>
                                </card_1.Card>))) : (courses.map(course => (<card_1.Card key={course.id} className="group flex flex-col overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                                    <react_router_dom_1.Link to={`/course/${course.id}`} className="block">
                                        <div className="aspect-video overflow-hidden">
                                            {course.thumbnail ? (<img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform group-hover:scale-105"/>) : (<div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">No Image</div>)}
                                        </div>
                                    </react_router_dom_1.Link>
                                    <card_1.CardHeader className="space-y-1 p-6">
                                        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                                            <span>Best Seller</span>
                                        </div>
                                        <card_1.CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                                            <react_router_dom_1.Link to={`/course/${course.id}`}>{course.title}</react_router_dom_1.Link>
                                        </card_1.CardTitle>
                                        <p className="text-sm text-muted-foreground">{course.instructor.name}</p>
                                    </card_1.CardHeader>
                                    <card_1.CardContent className="px-6 flex-1 pt-0">
                                        <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                                            <span>{course.avgRating?.toFixed(1) || "0.0"}</span>
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((s) => (<lucide_react_1.Star key={s} className={`h-3 w-3 ${Number(course.avgRating || 0) >= s ? 'fill-current' : 'text-muted'}`}/>))}
                                            </div>
                                            <span className="text-muted-foreground font-normal">({course.totalReviews || 0})</span>
                                        </div>
                                        <div className="mt-4 font-bold text-xl">${course.price}</div>
                                    </card_1.CardContent>
                                    <card_1.CardFooter className="p-6 pt-0">
                                        <button_1.Button className="w-full" variant="secondary" asChild>
                                            <react_router_dom_1.Link to={`/course/${course.id}`}>Learn More</react_router_dom_1.Link>
                                        </button_1.Button>
                                    </card_1.CardFooter>
                                </card_1.Card>)))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container py-24">
                <div className="rounded-3xl bg-primary px-6 py-20 text-center text-primary-foreground md:px-12 lg:py-32 overflow-hidden relative">
                    <div className="relative z-10 space-y-8">
                        <h2 className="mx-auto max-w-[50rem] text-4xl font-bold sm:text-5xl md:text-6xl">
                            Ready to start your learning journey?
                        </h2>
                        <p className="mx-auto max-w-[30rem] text-primary-foreground/80 sm:text-lg">
                            Get unlimited access to over 150+ high-quality courses with our monthly subscription.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <button_1.Button variant="secondary" size="lg" className="rounded-full px-8">Join Now</button_1.Button>
                            <button_1.Button variant="ghost" className="text-primary-foreground hover:bg-white/10 rounded-full px-8" asChild>
                                <react_router_dom_1.Link to="/login">Sign In</react_router_dom_1.Link>
                            </button_1.Button>
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-[500px] w-[500px] rounded-full bg-white/10 blur-[100px]"/>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-12 md:py-24">
                <div className="container flex flex-col gap-8 md:flex-row md:justify-between">
                    <div className="space-y-4 max-w-sm">
                        <react_router_dom_1.Link to="/" className="text-2xl font-bold tracking-tight">nexus</react_router_dom_1.Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Empowering millions of learners around the world through accessible, world-class education. Join the revolution.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-12 sm:grid-cols-3">
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold uppercase tracking-wider">LMS</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><react_router_dom_1.Link to="/courses" className="hover:text-primary">Courses</react_router_dom_1.Link></li>
                                <li><react_router_dom_1.Link to="/dashboard" className="hover:text-primary">My Learning</react_router_dom_1.Link></li>
                                <li><react_router_dom_1.Link to="/instructor" className="hover:text-primary">Teach on Nexus</react_router_dom_1.Link></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold uppercase tracking-wider">Legal</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><react_router_dom_1.Link to="#" className="hover:text-primary">Privacy Policy</react_router_dom_1.Link></li>
                                <li><react_router_dom_1.Link to="#" className="hover:text-primary">Terms of Service</react_router_dom_1.Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="container mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                    &copy; 2026 Nexus LMS. All rights reserved.
                </div>
            </footer>
        </div>);
}
