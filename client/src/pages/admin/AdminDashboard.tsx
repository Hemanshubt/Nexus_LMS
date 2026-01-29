import { useState, useEffect } from "react";
import { api } from "@/services/api";
import {
    Users,
    BookOpen,
    ShieldCheck,
    Trash2,
    Search,
    MoreHorizontal,
    UserPlus,
    LayoutDashboard,
    TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

interface Course {
    id: string;
    title: string;
    price: number;
    published: boolean;
    instructor: { name: string };
}

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, coursesRes] = await Promise.all([
                api.get('/users'),
                api.get('/courses?all=true')
            ]);
            setUsers(usersRes.data.data.users);
            setCourses(coursesRes.data.data.courses);
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        }
    };

    const updateRole = async (userId: string, newRole: string) => {
        try {
            await api.patch(`/users/${userId}`, { role: newRole });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error("Failed to update role", error);
        }
    };

    const deleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
        try {
            await api.delete(`/users/${userId}`);
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    const togglePublish = async (courseId: string, currentStatus: boolean) => {
        try {
            await api.patch(`/courses/${courseId}`, { published: !currentStatus });
            setCourses(courses.map(c => c.id === courseId ? { ...c, published: !currentStatus } : c));
        } catch (error) {
            console.error("Failed to update course status", error);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container py-10 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">System Admin</h1>
                    <p className="text-muted-foreground text-lg">Manage users, content, and platform settings.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={fetchData}>Refresh Data</Button>
                    <Button className="gap-2"><UserPlus className="w-4 h-4" /> Add User</Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="border-none shadow-sm bg-primary text-primary-foreground">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <TrendingUp className="w-4 h-4 opacity-50" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs opacity-70">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                        <Users className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.filter(u => u.role === 'STUDENT').length}</div>
                        <p className="text-xs text-muted-foreground">+180 since last week</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Instructors</CardTitle>
                        <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.filter(u => u.role === 'INSTRUCTOR').length}</div>
                        <p className="text-xs text-muted-foreground">3 new pending review</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Published Courses</CardTitle>
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{courses.filter(c => c.published).length}</div>
                        <p className="text-xs text-muted-foreground">Across 12 categories</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="users" className="space-y-6">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="users" className="gap-2"><Users className="w-4 h-4" /> Users</TabsTrigger>
                    <TabsTrigger value="courses" className="gap-2"><BookOpen className="w-4 h-4" /> Courses</TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2"><LayoutDashboard className="w-4 h-4" /> Parameters</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                    <div className="flex items-center gap-4 py-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Filter users by name or email..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline">Export CSV</Button>
                    </div>

                    <Card className="border-none shadow-md overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[250px]">User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Joined Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-muted/30">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold">{user.name}</span>
                                                <span className="text-sm text-muted-foreground">{user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'INSTRUCTOR' ? 'default' : 'secondary'}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-green-500 border-green-500 bg-green-500/5">Active</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Manage Roles</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => updateRole(user.id, 'STUDENT')}>Make Student</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateRole(user.id, 'INSTRUCTOR')}>Promote to Instructor</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateRole(user.id, 'ADMIN')}>Promote to Admin</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive font-medium" onClick={() => deleteUser(user.id)}>
                                                        <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="courses" className="space-y-4">
                    <Card className="border-none shadow-md overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Course Title</TableHead>
                                    <TableHead>Instructor</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {courses.map((course) => (
                                    <TableRow key={course.id}>
                                        <TableCell className="font-bold">{course.title}</TableCell>
                                        <TableCell>{course.instructor.name}</TableCell>
                                        <TableCell>${course.price}</TableCell>
                                        <TableCell>
                                            <Badge variant={course.published ? 'default' : 'outline'}>
                                                {course.published ? 'Published' : 'Draft'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => togglePublish(course.id, course.published)}
                                            >
                                                {course.published ? 'Unpublish' : 'Publish'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
