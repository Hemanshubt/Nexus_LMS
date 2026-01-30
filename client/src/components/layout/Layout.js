"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_router_dom_1 = require("react-router-dom");
const useAuthStore_1 = require("@/store/useAuthStore");
const button_1 = require("@/components/ui/button");
const ThemeToggle_1 = require("@/components/ThemeToggle");
const NotificationBell_1 = __importDefault(require("@/components/common/NotificationBell"));
const lucide_react_1 = require("lucide-react");
const Layout = () => {
    const { user, logout } = (0, useAuthStore_1.useAuthStore)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const handleLogout = async () => {
        await logout();
        navigate('/');
    };
    return (<div className="flex min-h-screen flex-col bg-background">
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
                <div className="container flex h-16 items-center">
                    <div className="mr-4 hidden md:flex">
                        <react_router_dom_1.Link to="/" className="mr-6 flex items-center space-x-2">
                            <span className="text-xl font-black tracking-tighter text-primary">NEXUS</span>
                        </react_router_dom_1.Link>
                        <nav className="flex items-center space-x-6 text-sm font-semibold">
                            <react_router_dom_1.Link to="/courses" className="transition-colors hover:text-primary">Courses</react_router_dom_1.Link>
                            {user && (<react_router_dom_1.Link to="/student/dashboard" className="transition-colors hover:text-primary">My Learning</react_router_dom_1.Link>)}
                            {user && user.role === 'INSTRUCTOR' && (<react_router_dom_1.Link to="/instructor/dashboard" className="transition-colors hover:text-primary">Instructor Panel</react_router_dom_1.Link>)}
                            {user && user.role === 'ADMIN' && (<react_router_dom_1.Link to="/admin/dashboard" className="transition-colors hover:text-primary">Admin Panel</react_router_dom_1.Link>)}
                        </nav>
                    </div>
                    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                        <nav className="flex items-center space-x-2">
                            {user ? (<>
                                    <react_router_dom_1.Link to="/student/wishlist" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-10 w-10" title="My Wishlist">
                                        <lucide_react_1.Heart className="h-5 w-5"/>
                                    </react_router_dom_1.Link>
                                    <NotificationBell_1.default />
                                    <react_router_dom_1.Link to="/profile" className="text-sm font-medium transition-colors hover:text-primary px-3">
                                        Profile
                                    </react_router_dom_1.Link>
                                    <button_1.Button variant="ghost" size="sm" onClick={handleLogout}>
                                        Logout
                                    </button_1.Button>
                                </>) : (<>
                                    <react_router_dom_1.Link to="/login" className="text-sm font-medium transition-colors hover:text-primary">
                                        Login
                                    </react_router_dom_1.Link>
                                    <react_router_dom_1.Link to="/register" className="text-sm font-medium transition-colors hover:text-primary">
                                        Sign Up
                                    </react_router_dom_1.Link>
                                </>)}
                            <ThemeToggle_1.ThemeToggle />
                        </nav>
                    </div>
                </div>
            </header>
            <main className="flex-1">
                <react_router_dom_1.Outlet />
            </main>
            <footer className="py-6 md:px-8 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                    <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built by Antigravity.
                    </p>
                </div>
            </footer>
        </div>);
};
exports.default = Layout;
