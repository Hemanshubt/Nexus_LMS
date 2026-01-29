import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import StudentDashboard from '@/pages/student/StudentDashboard';
import InstructorDashboard from '@/pages/instructor/InstructorDashboard';
import CreateCoursePage from '@/pages/instructor/CreateCoursePage';
import CourseEditorPage from '@/pages/instructor/CourseEditorPage';
import CoursePlayerPage from '@/pages/student/CoursePlayerPage';
import CertificatePage from '@/pages/student/certificate/CertificatePage';
import ProfilePage from '@/pages/ProfilePage';
import AssignmentSubmissionsPage from '@/pages/instructor/AssignmentSubmissionsPage';
import CourseDetailsPage from '@/pages/student/CourseDetailsPage';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import AdminDashboard from '@/pages/admin/AdminDashboard';

import { ProtectedRoute, PublicRoute } from '@/components/auth/ProtectedRoute';

function App() {
    const { checkAuth, isLoading } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isLoading) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
                <div className="animate-pulse space-y-4 text-center">
                    <div className="text-4xl font-black tracking-tighter text-primary">NEXUS</div>
                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Synchronizing Environment...</div>
                </div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<LandingPage />} />

                    {/* Public Auth Routes (Redirect to dashboard if already logged in) */}
                    <Route path="login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                    <Route path="register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

                    {/* Student Routes */}
                    <Route path="dashboard" element={<ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'INSTRUCTOR']}><StudentDashboard /></ProtectedRoute>} />
                    <Route path="courses" element={<StudentDashboard />} />
                    <Route path="course/:courseId" element={<CourseDetailsPage />} />
                    <Route path="learn/:courseId" element={<ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'INSTRUCTOR']}><CoursePlayerPage /></ProtectedRoute>} />
                    <Route path="certificate/:courseId" element={<ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'INSTRUCTOR']}><CertificatePage /></ProtectedRoute>} />
                    <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                    {/* Instructor Routes */}
                    <Route path="instructor/dashboard" element={<ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}><InstructorDashboard /></ProtectedRoute>} />
                    <Route path="instructor/courses/new" element={<ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}><CreateCoursePage /></ProtectedRoute>} />
                    <Route path="instructor/courses/:courseId/edit" element={<ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}><CourseEditorPage /></ProtectedRoute>} />
                    <Route path="instructor/courses/:courseId/submissions" element={<ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}><AssignmentSubmissionsPage /></ProtectedRoute>} />

                    {/* Admin Routes */}
                    <Route path="admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App
