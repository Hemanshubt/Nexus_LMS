"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdminDashboard;
const react_1 = require("react");
const api_1 = require("@/services/api");
const lucide_react_1 = require("lucide-react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const badge_1 = require("@/components/ui/badge");
const table_1 = require("@/components/ui/table");
const dropdown_menu_1 = require("@/components/ui/dropdown-menu");
const tabs_1 = require("@/components/ui/tabs");
function AdminDashboard() {
    const [users, setUsers] = (0, react_1.useState)([]);
    const [courses, setCourses] = (0, react_1.useState)([]);
    const [searchQuery, setSearchQuery] = (0, react_1.useState)("");
    (0, react_1.useEffect)(() => {
        fetchData();
    }, []);
    const fetchData = async () => {
        try {
            const [usersRes, coursesRes] = await Promise.all([
                api_1.api.get('/users'),
                api_1.api.get('/courses?all=true')
            ]);
            setUsers(usersRes.data.data.users);
            setCourses(coursesRes.data.data.courses);
        }
        catch (error) {
            console.error("Failed to fetch admin data", error);
        }
    };
    const updateRole = async (userId, newRole) => {
        try {
            await api_1.api.patch(`/users/${userId}`, { role: newRole });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        }
        catch (error) {
            console.error("Failed to update role", error);
        }
    };
    const deleteUser = async (userId) => {
        if (!confirm("Are you sure you want to delete this user? This cannot be undone."))
            return;
        try {
            await api_1.api.delete(`/users/${userId}`);
            setUsers(users.filter(u => u.id !== userId));
        }
        catch (error) {
            console.error("Failed to delete user", error);
        }
    };
    const togglePublish = async (courseId, currentStatus) => {
        try {
            await api_1.api.patch(`/courses/${courseId}`, { published: !currentStatus });
            setCourses(courses.map(c => c.id === courseId ? { ...c, published: !currentStatus } : c));
        }
        catch (error) {
            console.error("Failed to update course status", error);
        }
    };
    const filteredUsers = users.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return (<div className="container py-10 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">System Admin</h1>
                    <p className="text-muted-foreground text-lg">Manage users, content, and platform settings.</p>
                </div>
                <div className="flex gap-4">
                    <button_1.Button variant="outline" onClick={fetchData}>Refresh Data</button_1.Button>
                    <button_1.Button className="gap-2"><lucide_react_1.UserPlus className="w-4 h-4"/> Add User</button_1.Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <card_1.Card className="border-none shadow-sm bg-primary text-primary-foreground">
                    <card_1.CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <card_1.CardTitle className="text-sm font-medium">Total Revenue</card_1.CardTitle>
                        <lucide_react_1.TrendingUp className="w-4 h-4 opacity-50"/>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs opacity-70">+20.1% from last month</p>
                    </card_1.CardContent>
                </card_1.Card>
                <card_1.Card className="border-none shadow-sm">
                    <card_1.CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <card_1.CardTitle className="text-sm font-medium">Active Students</card_1.CardTitle>
                        <lucide_react_1.Users className="w-4 h-4 text-muted-foreground"/>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                        <div className="text-2xl font-bold">{users.filter(u => u.role === 'STUDENT').length}</div>
                        <p className="text-xs text-muted-foreground">+180 since last week</p>
                    </card_1.CardContent>
                </card_1.Card>
                <card_1.Card className="border-none shadow-sm">
                    <card_1.CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <card_1.CardTitle className="text-sm font-medium">Instructors</card_1.CardTitle>
                        <lucide_react_1.ShieldCheck className="w-4 h-4 text-muted-foreground"/>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                        <div className="text-2xl font-bold">{users.filter(u => u.role === 'INSTRUCTOR').length}</div>
                        <p className="text-xs text-muted-foreground">3 new pending review</p>
                    </card_1.CardContent>
                </card_1.Card>
                <card_1.Card className="border-none shadow-sm">
                    <card_1.CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <card_1.CardTitle className="text-sm font-medium">Published Courses</card_1.CardTitle>
                        <lucide_react_1.BookOpen className="w-4 h-4 text-muted-foreground"/>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                        <div className="text-2xl font-bold">{courses.filter(c => c.published).length}</div>
                        <p className="text-xs text-muted-foreground">Across 12 categories</p>
                    </card_1.CardContent>
                </card_1.Card>
            </div>

            <tabs_1.Tabs defaultValue="users" className="space-y-6">
                <tabs_1.TabsList className="bg-muted/50 p-1">
                    <tabs_1.TabsTrigger value="users" className="gap-2"><lucide_react_1.Users className="w-4 h-4"/> Users</tabs_1.TabsTrigger>
                    <tabs_1.TabsTrigger value="courses" className="gap-2"><lucide_react_1.BookOpen className="w-4 h-4"/> Courses</tabs_1.TabsTrigger>
                    <tabs_1.TabsTrigger value="settings" className="gap-2"><lucide_react_1.LayoutDashboard className="w-4 h-4"/> Parameters</tabs_1.TabsTrigger>
                </tabs_1.TabsList>

                <tabs_1.TabsContent value="users" className="space-y-4">
                    <div className="flex items-center gap-4 py-4">
                        <div className="relative flex-1">
                            <lucide_react_1.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                            <input_1.Input placeholder="Filter users by name or email..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                        </div>
                        <button_1.Button variant="outline">Export CSV</button_1.Button>
                    </div>

                    <card_1.Card className="border-none shadow-md overflow-hidden">
                        <table_1.Table>
                            <table_1.TableHeader className="bg-muted/50">
                                <table_1.TableRow>
                                    <table_1.TableHead className="w-[250px]">User</table_1.TableHead>
                                    <table_1.TableHead>Role</table_1.TableHead>
                                    <table_1.TableHead>Joined Date</table_1.TableHead>
                                    <table_1.TableHead>Status</table_1.TableHead>
                                    <table_1.TableHead className="text-right">Actions</table_1.TableHead>
                                </table_1.TableRow>
                            </table_1.TableHeader>
                            <table_1.TableBody>
                                {filteredUsers.map((user) => (<table_1.TableRow key={user.id} className="hover:bg-muted/30">
                                        <table_1.TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold">{user.name}</span>
                                                <span className="text-sm text-muted-foreground">{user.email}</span>
                                            </div>
                                        </table_1.TableCell>
                                        <table_1.TableCell>
                                            <badge_1.Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'INSTRUCTOR' ? 'default' : 'secondary'}>
                                                {user.role}
                                            </badge_1.Badge>
                                        </table_1.TableCell>
                                        <table_1.TableCell className="text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </table_1.TableCell>
                                        <table_1.TableCell>
                                            <badge_1.Badge variant="outline" className="text-green-500 border-green-500 bg-green-500/5">Active</badge_1.Badge>
                                        </table_1.TableCell>
                                        <table_1.TableCell className="text-right">
                                            <dropdown_menu_1.DropdownMenu>
                                                <dropdown_menu_1.DropdownMenuTrigger asChild>
                                                    <button_1.Button variant="ghost" className="h-8 w-8 p-0">
                                                        <lucide_react_1.MoreHorizontal className="h-4 w-4"/>
                                                    </button_1.Button>
                                                </dropdown_menu_1.DropdownMenuTrigger>
                                                <dropdown_menu_1.DropdownMenuContent align="end">
                                                    <dropdown_menu_1.DropdownMenuLabel>Manage Roles</dropdown_menu_1.DropdownMenuLabel>
                                                    <dropdown_menu_1.DropdownMenuItem onClick={() => updateRole(user.id, 'STUDENT')}>Make Student</dropdown_menu_1.DropdownMenuItem>
                                                    <dropdown_menu_1.DropdownMenuItem onClick={() => updateRole(user.id, 'INSTRUCTOR')}>Promote to Instructor</dropdown_menu_1.DropdownMenuItem>
                                                    <dropdown_menu_1.DropdownMenuItem onClick={() => updateRole(user.id, 'ADMIN')}>Promote to Admin</dropdown_menu_1.DropdownMenuItem>
                                                    <dropdown_menu_1.DropdownMenuSeparator />
                                                    <dropdown_menu_1.DropdownMenuItem className="text-destructive font-medium" onClick={() => deleteUser(user.id)}>
                                                        <lucide_react_1.Trash2 className="w-4 h-4 mr-2"/> Delete Account
                                                    </dropdown_menu_1.DropdownMenuItem>
                                                </dropdown_menu_1.DropdownMenuContent>
                                            </dropdown_menu_1.DropdownMenu>
                                        </table_1.TableCell>
                                    </table_1.TableRow>))}
                            </table_1.TableBody>
                        </table_1.Table>
                    </card_1.Card>
                </tabs_1.TabsContent>

                <tabs_1.TabsContent value="courses" className="space-y-4">
                    <card_1.Card className="border-none shadow-md overflow-hidden">
                        <table_1.Table>
                            <table_1.TableHeader className="bg-muted/50">
                                <table_1.TableRow>
                                    <table_1.TableHead>Course Title</table_1.TableHead>
                                    <table_1.TableHead>Instructor</table_1.TableHead>
                                    <table_1.TableHead>Price</table_1.TableHead>
                                    <table_1.TableHead>Status</table_1.TableHead>
                                    <table_1.TableHead className="text-right">Actions</table_1.TableHead>
                                </table_1.TableRow>
                            </table_1.TableHeader>
                            <table_1.TableBody>
                                {courses.map((course) => (<table_1.TableRow key={course.id}>
                                        <table_1.TableCell className="font-bold">{course.title}</table_1.TableCell>
                                        <table_1.TableCell>{course.instructor.name}</table_1.TableCell>
                                        <table_1.TableCell>${course.price}</table_1.TableCell>
                                        <table_1.TableCell>
                                            <badge_1.Badge variant={course.published ? 'default' : 'outline'}>
                                                {course.published ? 'Published' : 'Draft'}
                                            </badge_1.Badge>
                                        </table_1.TableCell>
                                        <table_1.TableCell className="text-right">
                                            <button_1.Button variant="outline" size="sm" onClick={() => togglePublish(course.id, course.published)}>
                                                {course.published ? 'Unpublish' : 'Publish'}
                                            </button_1.Button>
                                        </table_1.TableCell>
                                    </table_1.TableRow>))}
                            </table_1.TableBody>
                        </table_1.Table>
                    </card_1.Card>
                </tabs_1.TabsContent>
            </tabs_1.Tabs>
        </div>);
}
