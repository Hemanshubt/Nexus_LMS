import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

const Layout = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
                <div className="container flex h-16 items-center">
                    <div className="mr-4 hidden md:flex">
                        <Link to="/" className="mr-6 flex items-center space-x-2">
                            <span className="text-xl font-black tracking-tighter text-primary">NEXUS</span>
                        </Link>
                        <nav className="flex items-center space-x-6 text-sm font-semibold">
                            <Link to="/courses" className="transition-colors hover:text-primary">Courses</Link>
                            {user && user.role === 'INSTRUCTOR' && (
                                <Link to="/instructor/dashboard" className="transition-colors hover:text-primary">Instructor Panel</Link>
                            )}
                            {user && user.role === 'ADMIN' && (
                                <Link to="/admin/dashboard" className="transition-colors hover:text-primary">Admin Panel</Link>
                            )}
                        </nav>
                    </div>
                    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                        <nav className="flex items-center space-x-4">
                            {user ? (
                                <>
                                    <Link to="/profile" className="text-sm font-medium transition-colors hover:text-primary">
                                        Profile
                                    </Link>
                                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-sm font-medium transition-colors hover:text-primary">
                                        Login
                                    </Link>
                                    <Link to="/register" className="text-sm font-medium transition-colors hover:text-primary">
                                        Sign Up
                                    </Link>
                                </>
                            )}
                            <ThemeToggle />
                        </nav>
                    </div>
                </div>
            </header>
            <main className="flex-1">
                <Outlet />
            </main>
            <footer className="py-6 md:px-8 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                    <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built by Antigravity.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
