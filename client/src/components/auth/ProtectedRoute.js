"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtectedRoute = ProtectedRoute;
exports.PublicRoute = PublicRoute;
const react_router_dom_1 = require("react-router-dom");
const useAuthStore_1 = require("@/store/useAuthStore");
function ProtectedRoute({ children, allowedRoles }) {
    const { user, isAuthenticated, isLoading } = (0, useAuthStore_1.useAuthStore)();
    const location = (0, react_router_dom_1.useLocation)();
    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }
    if (!isAuthenticated) {
        // Redirect to login but keep current location
        return <react_router_dom_1.Navigate to="/login" state={{ from: location }} replace/>;
    }
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // User role not allowed - redirect to their respective dashboard
        if (user.role === 'ADMIN')
            return <react_router_dom_1.Navigate to="/admin/dashboard" replace/>;
        if (user.role === 'INSTRUCTOR')
            return <react_router_dom_1.Navigate to="/instructor/dashboard" replace/>;
        return <react_router_dom_1.Navigate to="/dashboard" replace/>;
    }
    return <>{children}</>;
}
function PublicRoute({ children }) {
    const { user, isAuthenticated } = (0, useAuthStore_1.useAuthStore)();
    if (isAuthenticated && user) {
        // If already logged in, redirect to correct dashboard
        if (user.role === 'ADMIN')
            return <react_router_dom_1.Navigate to="/admin/dashboard" replace/>;
        if (user.role === 'INSTRUCTOR')
            return <react_router_dom_1.Navigate to="/instructor/dashboard" replace/>;
        return <react_router_dom_1.Navigate to="/dashboard" replace/>;
    }
    return <>{children}</>;
}
