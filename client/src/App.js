"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_router_dom_1 = require("react-router-dom");
const Layout_1 = __importDefault(require("@/components/layout/Layout"));
const LandingPage_1 = __importDefault(require("@/pages/LandingPage"));
const LoginPage_1 = __importDefault(require("@/pages/LoginPage"));
const RegisterPage_1 = __importDefault(require("@/pages/RegisterPage"));
const StudentDashboard_1 = __importDefault(require("@/pages/student/StudentDashboard"));
const InstructorDashboard_1 = __importDefault(require("@/pages/instructor/InstructorDashboard"));
const CreateCoursePage_1 = __importDefault(require("@/pages/instructor/CreateCoursePage"));
const CourseEditorPage_1 = __importDefault(require("@/pages/instructor/CourseEditorPage"));
const CoursePlayerPage_1 = __importDefault(require("@/pages/student/CoursePlayerPage"));
const CertificatePage_1 = __importDefault(require("@/pages/student/certificate/CertificatePage"));
const ProfilePage_1 = __importDefault(require("@/pages/ProfilePage"));
const AssignmentSubmissionsPage_1 = __importDefault(require("@/pages/instructor/AssignmentSubmissionsPage"));
const CourseDetailsPage_1 = __importDefault(require("@/pages/student/CourseDetailsPage"));
const WishlistPage_1 = __importDefault(require("@/pages/student/WishlistPage"));
const react_1 = require("react");
const useAuthStore_1 = require("@/store/useAuthStore");
const AdminDashboard_1 = __importDefault(require("@/pages/admin/AdminDashboard"));
const ProtectedRoute_1 = require("@/components/auth/ProtectedRoute");
function App() {
    const { checkAuth, isLoading } = (0, useAuthStore_1.useAuthStore)();
    (0, react_1.useEffect)(() => {
        checkAuth();
    }, [checkAuth]);
    if (isLoading) {
        return (<div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
                <div className="animate-pulse space-y-4 text-center">
                    <div className="text-4xl font-black tracking-tighter text-primary">NEXUS</div>
                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Synchronizing Environment...</div>
                </div>
            </div>);
    }
    return (<react_router_dom_1.BrowserRouter>
            <react_router_dom_1.Routes>
                <react_router_dom_1.Route path="/" element={<Layout_1.default />}>
                    <react_router_dom_1.Route index element={<LandingPage_1.default />}/>

                    {/* Public Auth Routes (Redirect to dashboard if already logged in) */}
                    <react_router_dom_1.Route path="login" element={<ProtectedRoute_1.PublicRoute><LoginPage_1.default /></ProtectedRoute_1.PublicRoute>}/>
                    <react_router_dom_1.Route path="register" element={<ProtectedRoute_1.PublicRoute><RegisterPage_1.default /></ProtectedRoute_1.PublicRoute>}/>

                    {/* Student Routes */}
                    <react_router_dom_1.Route path="dashboard" element={<ProtectedRoute_1.ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'INSTRUCTOR']}><StudentDashboard_1.default /></ProtectedRoute_1.ProtectedRoute>}/>
                    <react_router_dom_1.Route path="student/dashboard" element={<ProtectedRoute_1.ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'INSTRUCTOR']}><StudentDashboard_1.default /></ProtectedRoute_1.ProtectedRoute>}/>
                    <react_router_dom_1.Route path="student/wishlist" element={<ProtectedRoute_1.ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'INSTRUCTOR']}><WishlistPage_1.default /></ProtectedRoute_1.ProtectedRoute>}/>
                    <react_router_dom_1.Route path="courses" element={<StudentDashboard_1.default />}/>
                    <react_router_dom_1.Route path="course/:courseId" element={<CourseDetailsPage_1.default />}/>
                    <react_router_dom_1.Route path="learn/:courseId" element={<ProtectedRoute_1.ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'INSTRUCTOR']}><CoursePlayerPage_1.default /></ProtectedRoute_1.ProtectedRoute>}/>
                    <react_router_dom_1.Route path="certificate/:courseId" element={<ProtectedRoute_1.ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'INSTRUCTOR']}><CertificatePage_1.default /></ProtectedRoute_1.ProtectedRoute>}/>
                    <react_router_dom_1.Route path="profile" element={<ProtectedRoute_1.ProtectedRoute><ProfilePage_1.default /></ProtectedRoute_1.ProtectedRoute>}/>

                    {/* Instructor Routes */}
                    <react_router_dom_1.Route path="instructor/dashboard" element={<ProtectedRoute_1.ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}><InstructorDashboard_1.default /></ProtectedRoute_1.ProtectedRoute>}/>
                    <react_router_dom_1.Route path="instructor/courses/new" element={<ProtectedRoute_1.ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}><CreateCoursePage_1.default /></ProtectedRoute_1.ProtectedRoute>}/>
                    <react_router_dom_1.Route path="instructor/courses/:courseId/edit" element={<ProtectedRoute_1.ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}><CourseEditorPage_1.default /></ProtectedRoute_1.ProtectedRoute>}/>
                    <react_router_dom_1.Route path="instructor/courses/:courseId/submissions" element={<ProtectedRoute_1.ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}><AssignmentSubmissionsPage_1.default /></ProtectedRoute_1.ProtectedRoute>}/>

                    {/* Admin Routes */}
                    <react_router_dom_1.Route path="admin/dashboard" element={<ProtectedRoute_1.ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard_1.default /></ProtectedRoute_1.ProtectedRoute>}/>
                </react_router_dom_1.Route>
            </react_router_dom_1.Routes>
        </react_router_dom_1.BrowserRouter>);
}
exports.default = App;
