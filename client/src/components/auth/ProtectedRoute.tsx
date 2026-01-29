import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('STUDENT' | 'INSTRUCTOR' | 'ADMIN')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const location = useLocation();

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated) {
        // Redirect to login but keep current location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // User role not allowed - redirect to their respective dashboard
        if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'INSTRUCTOR') return <Navigate to="/instructor/dashboard" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated } = useAuthStore();

    if (isAuthenticated && user) {
        // If already logged in, redirect to correct dashboard
        if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'INSTRUCTOR') return <Navigate to="/instructor/dashboard" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
