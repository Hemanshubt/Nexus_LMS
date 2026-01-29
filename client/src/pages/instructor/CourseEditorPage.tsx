import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { api } from "@/services/api"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import VideoUpload from "@/components/instructor/VideoUpload"
import QuizBuilder from "@/components/instructor/QuizBuilder"
import AssignmentBuilder from "@/components/instructor/AssignmentBuilder"
import FileUpload from "@/components/common/FileUpload"
import { Video, FileText, CheckSquare, FileUp, Settings as SettingsIcon, Layers } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Lesson {
    id: string;
    title: string;
    order: number;
    videoUrl?: string;
    duration?: number;
    type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT';
    content?: string;
}

interface Section {
    id: string;
    title: string;
    order: number;
    lessons: Lesson[];
}

export default function CourseEditorPage() {
    const { courseId } = useParams();
    const [sections, setSections] = useState<Section[]>([]);
    const [newSectionTitle, setNewSectionTitle] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    // Course Settings State
    const [courseTitle, setCourseTitle] = useState("");
    const [courseDescription, setCourseDescription] = useState("");
    const [coursePrice, setCoursePrice] = useState(0);
    const [courseThumbnail, setCourseThumbnail] = useState("");

    const [lessonTitles, setLessonTitles] = useState<{ [key: string]: string }>({});

    // Edit Lesson State
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [editVideoUrl, setEditVideoUrl] = useState("");
    const [editContent, setEditContent] = useState("");
    const [editType, setEditType] = useState<Lesson['type']>('VIDEO');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    useEffect(() => {
        fetchCourseAndSections();
    }, [courseId]);

    const fetchCourseAndSections = async () => {
        try {
            const res = await api.get(`/courses/${courseId}`);
            if (res.data.data.course.sections) {
                setSections(res.data.data.course.sections);
            }
            const c = res.data.data.course;
            setCourseTitle(c.title);
            setCourseDescription(c.description || "");
            setCoursePrice(c.price || 0);
            setCourseThumbnail(c.thumbnail || "");
        } catch (error) {
            console.error("Failed to fetch course", error);
        } finally {
            setIsLoading(false);
        }
    };

    const addSection = async () => {
        if (!newSectionTitle || !courseId) return;
        try {
            const res = await api.post(`/courses/${courseId}/sections`, { title: newSectionTitle });
            setSections([...sections, { ...res.data.data.section, lessons: [] }]);
            setNewSectionTitle("");
        } catch (error) {
            console.error("Failed to create section", error);
        }
    };

    const addLesson = async (sectionId: string) => {
        const title = lessonTitles[sectionId];
        if (!title) return;

        try {
            const res = await api.post(`/courses/lessons`, { title, sectionId });
            const newLesson = res.data.data.lesson;
            setSections(sections.map(s => {
                if (s.id === sectionId) {
                    return { ...s, lessons: [...s.lessons, newLesson] };
                }
                return s;
            }));
            setLessonTitles({ ...lessonTitles, [sectionId]: "" });
        } catch (error) {
            console.error("Failed to create lesson", error);
        }
    }

    const startEditLesson = (lesson: Lesson) => {
        setEditingLesson(lesson);
        setEditVideoUrl(lesson.videoUrl || "");
        setEditContent(lesson.content || "");
        setEditType(lesson.type || 'VIDEO');
        setIsEditDialogOpen(true);
    };

    const saveLessonDetails = async () => {
        if (!editingLesson) return;
        try {
            // Include type and content updates
            await api.patch(`/courses/lessons/${editingLesson.id}`, {
                videoUrl: editVideoUrl,
                type: editType,
                content: editContent
            });

            // Optimistic Update
            setSections(sections.map(s => ({
                ...s,
                lessons: s.lessons.map(l => l.id === editingLesson.id ? {
                    ...l,
                    videoUrl: editVideoUrl,
                    type: editType,
                    content: editContent
                } : l)
            })));

            setIsEditDialogOpen(false);
        } catch (err) {
            console.error("Failed to update lesson", err);
        }
    };

    const handleUpdateSettings = async () => {
        setIsSavingSettings(true);
        try {
            await api.patch(`/courses/${courseId}`, {
                title: courseTitle,
                description: courseDescription,
                price: parseFloat(coursePrice.toString()),
                thumbnail: courseThumbnail
            });
            alert("Course settings updated successfully!");
        } catch (error) {
            console.error("Failed to update course settings", error);
            alert("Failed to update settings.");
        } finally {
            setIsSavingSettings(false);
        }
    };

    if (isLoading) return <div className="p-10">Loading editor...</div>;

    return (
        <div className="container py-10 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Edit Course Content</h1>
                    <p className="text-muted-foreground">Manage sections and lessons for your course.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link to="/instructor/dashboard">Back to Dashboard</Link>
                    </Button>
                    <Button>Publish Course</Button>
                </div>
            </div>

            <Tabs defaultValue="curriculum" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="curriculum" className="flex items-center gap-2">
                        <Layers className="w-4 h-4" /> Curriculum
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center gap-2">
                        <SettingsIcon className="w-4 h-4" /> Course Settings
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="curriculum" className="space-y-8">
                    <div className="grid gap-8">
                        {/* Add Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Add New Section</CardTitle>
                            </CardHeader>
                            <CardContent className="flex gap-4">
                                <div className="flex-1">
                                    <Label htmlFor="section-title" className="sr-only">Section Title</Label>
                                    <Input
                                        id="section-title"
                                        placeholder="e.g. Getting Started"
                                        value={newSectionTitle}
                                        onChange={(e) => setNewSectionTitle(e.target.value)}
                                    />
                                </div>
                                <Button onClick={addSection}>Add Section</Button>
                            </CardContent>
                        </Card>

                        {/* Sections List */}
                        <div className="space-y-4">
                            {sections.map((section, index) => (
                                <Card key={section.id}>
                                    <CardHeader className="flex flex-row items-center justify-between py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                                {index + 1}
                                            </span>
                                            <h3 className="font-semibold">{section.title}</h3>
                                        </div>
                                        <Button variant="ghost" size="sm">Delete</Button>
                                    </CardHeader>
                                    <CardContent className="pt-0 pl-12 border-t mt-2 pt-4">
                                        <div className="space-y-2 mb-4">
                                            {section.lessons.map((lesson) => (
                                                <div key={lesson.id} className="flex items-center justify-between border rounded p-2 bg-muted/50">
                                                    <div className="flex items-center gap-2">
                                                        {/* Icon based on type */}
                                                        {lesson.type === 'QUIZ' ? <CheckSquare className="h-4 w-4 text-blue-500" /> :
                                                            lesson.type === 'TEXT' ? <FileText className="h-4 w-4 text-orange-500" /> :
                                                                <Video className="h-4 w-4 text-primary" />}

                                                        <span className="text-sm font-medium">{lesson.title}</span>

                                                        {lesson.type === 'VIDEO' && lesson.videoUrl && (
                                                            <span className="text-[10px] bg-green-100 text-green-800 px-1 rounded">Video Added</span>
                                                        )}
                                                        {lesson.type === 'QUIZ' && (
                                                            <span className="text-[10px] bg-blue-100 text-blue-800 px-1 rounded">Quiz</span>
                                                        )}
                                                    </div>
                                                    <Button size="sm" variant="ghost" onClick={() => startEditLesson(lesson)}>Edit</Button>
                                                </div>
                                            ))}
                                            {section.lessons.length === 0 && (
                                                <div className="text-sm text-muted-foreground italic">
                                                    No lessons yet.
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="New Lesson Title..."
                                                className="h-8"
                                                value={lessonTitles[section.id] || ""}
                                                onChange={(e) => setLessonTitles({ ...lessonTitles, [section.id]: e.target.value })}
                                            />
                                            <Button size="sm" variant="secondary" onClick={() => addLesson(section.id)}>
                                                + Add Lesson
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Course Title</Label>
                                <Input
                                    value={courseTitle}
                                    onChange={(e) => setCourseTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={courseDescription}
                                    onChange={(e) => setCourseDescription(e.target.value)}
                                    className="min-h-[150px]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Price ($)</Label>
                                    <Input
                                        type="number"
                                        value={coursePrice}
                                        onChange={(e) => setCoursePrice(parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Course Thumbnail</Label>
                                <FileUpload
                                    onUploadComplete={(url) => setCourseThumbnail(url)}
                                    currentUrl={courseThumbnail}
                                    label="Thumbnail Image"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Update your course thumbnail. Recommended size: 1280x720.
                                </p>
                            </div>

                            <div className="pt-4">
                                <Button
                                    onClick={handleUpdateSettings}
                                    disabled={isSavingSettings}
                                    className="w-full lg:w-auto"
                                >
                                    {isSavingSettings ? "Saving..." : "Save All Changes"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Lesson Modal */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Edit Lesson: {editingLesson?.title}</DialogTitle>
                        <DialogDescription>
                            Choose the content type and add your materials.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4 flex-1 overflow-y-auto">

                        {/* Type Selection */}
                        <div className="flex gap-4 justify-center pb-4 border-b">
                            <Button
                                type="button"
                                variant={editType === 'VIDEO' ? 'default' : 'outline'}
                                onClick={() => setEditType('VIDEO')}
                                className="flex-1"
                            >
                                <Video className="w-4 h-4 mr-2" /> Video
                            </Button>
                            <Button
                                type="button"
                                variant={editType === 'TEXT' ? 'default' : 'outline'}
                                onClick={() => setEditType('TEXT')}
                                className="flex-1"
                            >
                                <FileText className="w-4 h-4 mr-2" /> Text/Article
                            </Button>
                            <Button
                                type="button"
                                variant={editType === 'QUIZ' ? 'default' : 'outline'}
                                onClick={() => setEditType('QUIZ')}
                                className="flex-1"
                            >
                                <CheckSquare className="w-4 h-4 mr-2" /> Quiz
                            </Button>
                            <Button
                                type="button"
                                variant={editType === 'ASSIGNMENT' ? 'default' : 'outline'}
                                onClick={() => setEditType('ASSIGNMENT')}
                                className="flex-1"
                            >
                                <FileUp className="w-4 h-4 mr-2" /> Assignment
                            </Button>
                        </div>

                        {/* Editors based on Type */}
                        {editType === 'VIDEO' && (
                            <VideoUpload
                                currentUrl={editVideoUrl}
                                onUploadComplete={(url) => setEditVideoUrl(url)}
                            />
                        )}

                        {editType === 'TEXT' && (
                            <div className="flex flex-col gap-2 h-full">
                                <Label>Lesson Content (Markdown)</Label>
                                <Textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="flex-1 min-h-[300px] font-mono"
                                    placeholder="# Lesson Title\n\nWrite your lesson content here..."
                                />
                            </div>
                        )}

                        {editType === 'QUIZ' && editingLesson && (
                            <QuizBuilder
                                lessonId={editingLesson.id}
                                onClose={() => setIsEditDialogOpen(false)}
                            />
                        )}

                        {editType === 'ASSIGNMENT' && editingLesson && (
                            <AssignmentBuilder
                                lessonId={editingLesson.id}
                                onClose={() => setIsEditDialogOpen(false)}
                            />
                        )}

                    </div>

                    <DialogFooter>
                        {/* If Quiz or Assignment, the save is handled inside, but we still might want to save the type change via "Save Meta" */}
                        {(editType !== 'QUIZ' && editType !== 'ASSIGNMENT') && (
                            <Button onClick={saveLessonDetails}>Save Changes</Button>
                        )}
                        {(editType === 'QUIZ' || editType === 'ASSIGNMENT') && (
                            <div className="text-xs text-muted-foreground mr-auto flex items-center">
                                Tip: Save content inside the builder.
                                Click "Update Lesson Type" to ensure the lesson is marked correctly.
                                <Button size="sm" variant="secondary" className="ml-4" onClick={saveLessonDetails}>
                                    Update Lesson Type
                                </Button>
                            </div>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
