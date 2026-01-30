"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CourseEditorPage;
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const card_1 = require("@/components/ui/card");
const label_1 = require("@/components/ui/label");
const textarea_1 = require("@/components/ui/textarea");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const api_1 = require("@/services/api");
const dialog_1 = require("@/components/ui/dialog");
const VideoUpload_1 = __importDefault(require("@/components/instructor/VideoUpload"));
const QuizBuilder_1 = __importDefault(require("@/components/instructor/QuizBuilder"));
const AssignmentBuilder_1 = __importDefault(require("@/components/instructor/AssignmentBuilder"));
const FileUpload_1 = __importDefault(require("@/components/common/FileUpload"));
const lucide_react_1 = require("lucide-react");
const tabs_1 = require("@/components/ui/tabs");
function CourseEditorPage() {
    const { courseId } = (0, react_router_dom_1.useParams)();
    const [sections, setSections] = (0, react_1.useState)([]);
    const [newSectionTitle, setNewSectionTitle] = (0, react_1.useState)("");
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [isSavingSettings, setIsSavingSettings] = (0, react_1.useState)(false);
    // Course Settings State
    const [courseTitle, setCourseTitle] = (0, react_1.useState)("");
    const [courseDescription, setCourseDescription] = (0, react_1.useState)("");
    const [coursePrice, setCoursePrice] = (0, react_1.useState)(0);
    const [courseThumbnail, setCourseThumbnail] = (0, react_1.useState)("");
    const [lessonTitles, setLessonTitles] = (0, react_1.useState)({});
    // Edit Lesson State
    const [editingLesson, setEditingLesson] = (0, react_1.useState)(null);
    const [editVideoUrl, setEditVideoUrl] = (0, react_1.useState)("");
    const [editContent, setEditContent] = (0, react_1.useState)("");
    const [editType, setEditType] = (0, react_1.useState)('VIDEO');
    const [isEditDialogOpen, setIsEditDialogOpen] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        fetchCourseAndSections();
    }, [courseId]);
    const fetchCourseAndSections = async () => {
        try {
            const res = await api_1.api.get(`/courses/${courseId}`);
            if (res.data.data.course.sections) {
                setSections(res.data.data.course.sections);
            }
            const c = res.data.data.course;
            setCourseTitle(c.title);
            setCourseDescription(c.description || "");
            setCoursePrice(c.price || 0);
            setCourseThumbnail(c.thumbnail || "");
        }
        catch (error) {
            console.error("Failed to fetch course", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const addSection = async () => {
        if (!newSectionTitle || !courseId)
            return;
        try {
            const res = await api_1.api.post(`/courses/${courseId}/sections`, { title: newSectionTitle });
            setSections([...sections, { ...res.data.data.section, lessons: [] }]);
            setNewSectionTitle("");
        }
        catch (error) {
            console.error("Failed to create section", error);
        }
    };
    const addLesson = async (sectionId) => {
        const title = lessonTitles[sectionId];
        if (!title)
            return;
        try {
            const res = await api_1.api.post(`/courses/lessons`, { title, sectionId });
            const newLesson = res.data.data.lesson;
            setSections(sections.map(s => {
                if (s.id === sectionId) {
                    return { ...s, lessons: [...s.lessons, newLesson] };
                }
                return s;
            }));
            setLessonTitles({ ...lessonTitles, [sectionId]: "" });
        }
        catch (error) {
            console.error("Failed to create lesson", error);
        }
    };
    const startEditLesson = (lesson) => {
        setEditingLesson(lesson);
        setEditVideoUrl(lesson.videoUrl || "");
        setEditContent(lesson.content || "");
        setEditType(lesson.type || 'VIDEO');
        setIsEditDialogOpen(true);
    };
    const saveLessonDetails = async () => {
        if (!editingLesson)
            return;
        try {
            // Include type and content updates
            await api_1.api.patch(`/courses/lessons/${editingLesson.id}`, {
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
        }
        catch (err) {
            console.error("Failed to update lesson", err);
        }
    };
    const handleUpdateSettings = async () => {
        setIsSavingSettings(true);
        try {
            await api_1.api.patch(`/courses/${courseId}`, {
                title: courseTitle,
                description: courseDescription,
                price: parseFloat(coursePrice.toString()),
                thumbnail: courseThumbnail
            });
            alert("Course settings updated successfully!");
        }
        catch (error) {
            console.error("Failed to update course settings", error);
            alert("Failed to update settings.");
        }
        finally {
            setIsSavingSettings(false);
        }
    };
    if (isLoading)
        return <div className="p-10">Loading editor...</div>;
    return (<div className="container py-10 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Edit Course Content</h1>
                    <p className="text-muted-foreground">Manage sections and lessons for your course.</p>
                </div>
                <div className="flex gap-2">
                    <button_1.Button variant="outline" asChild>
                        <react_router_dom_1.Link to="/instructor/dashboard">Back to Dashboard</react_router_dom_1.Link>
                    </button_1.Button>
                    <button_1.Button>Publish Course</button_1.Button>
                </div>
            </div>

            <tabs_1.Tabs defaultValue="curriculum" className="space-y-6">
                <tabs_1.TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <tabs_1.TabsTrigger value="curriculum" className="flex items-center gap-2">
                        <lucide_react_1.Layers className="w-4 h-4"/> Curriculum
                    </tabs_1.TabsTrigger>
                    <tabs_1.TabsTrigger value="settings" className="flex items-center gap-2">
                        <lucide_react_1.Settings className="w-4 h-4"/> Course Settings
                    </tabs_1.TabsTrigger>
                </tabs_1.TabsList>

                <tabs_1.TabsContent value="curriculum" className="space-y-8">
                    <div className="grid gap-8">
                        {/* Add Section */}
                        <card_1.Card>
                            <card_1.CardHeader>
                                <card_1.CardTitle className="text-lg">Add New Section</card_1.CardTitle>
                            </card_1.CardHeader>
                            <card_1.CardContent className="flex gap-4">
                                <div className="flex-1">
                                    <label_1.Label htmlFor="section-title" className="sr-only">Section Title</label_1.Label>
                                    <input_1.Input id="section-title" placeholder="e.g. Getting Started" value={newSectionTitle} onChange={(e) => setNewSectionTitle(e.target.value)}/>
                                </div>
                                <button_1.Button onClick={addSection}>Add Section</button_1.Button>
                            </card_1.CardContent>
                        </card_1.Card>

                        {/* Sections List */}
                        <div className="space-y-4">
                            {sections.map((section, index) => (<card_1.Card key={section.id}>
                                    <card_1.CardHeader className="flex flex-row items-center justify-between py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                                {index + 1}
                                            </span>
                                            <h3 className="font-semibold">{section.title}</h3>
                                        </div>
                                        <button_1.Button variant="ghost" size="sm">Delete</button_1.Button>
                                    </card_1.CardHeader>
                                    <card_1.CardContent className="pt-0 pl-12 border-t mt-2 pt-4">
                                        <div className="space-y-2 mb-4">
                                            {section.lessons.map((lesson) => (<div key={lesson.id} className="flex items-center justify-between border rounded p-2 bg-muted/50">
                                                    <div className="flex items-center gap-2">
                                                        {/* Icon based on type */}
                                                        {lesson.type === 'QUIZ' ? <lucide_react_1.CheckSquare className="h-4 w-4 text-blue-500"/> :
                    lesson.type === 'TEXT' ? <lucide_react_1.FileText className="h-4 w-4 text-orange-500"/> :
                        <lucide_react_1.Video className="h-4 w-4 text-primary"/>}

                                                        <span className="text-sm font-medium">{lesson.title}</span>

                                                        {lesson.type === 'VIDEO' && lesson.videoUrl && (<span className="text-[10px] bg-green-100 text-green-800 px-1 rounded">Video Added</span>)}
                                                        {lesson.type === 'QUIZ' && (<span className="text-[10px] bg-blue-100 text-blue-800 px-1 rounded">Quiz</span>)}
                                                    </div>
                                                    <button_1.Button size="sm" variant="ghost" onClick={() => startEditLesson(lesson)}>Edit</button_1.Button>
                                                </div>))}
                                            {section.lessons.length === 0 && (<div className="text-sm text-muted-foreground italic">
                                                    No lessons yet.
                                                </div>)}
                                        </div>

                                        <div className="flex gap-2">
                                            <input_1.Input placeholder="New Lesson Title..." className="h-8" value={lessonTitles[section.id] || ""} onChange={(e) => setLessonTitles({ ...lessonTitles, [section.id]: e.target.value })}/>
                                            <button_1.Button size="sm" variant="secondary" onClick={() => addLesson(section.id)}>
                                                + Add Lesson
                                            </button_1.Button>
                                        </div>
                                    </card_1.CardContent>
                                </card_1.Card>))}
                        </div>
                    </div>
                </tabs_1.TabsContent>

                <tabs_1.TabsContent value="settings">
                    <card_1.Card>
                        <card_1.CardHeader>
                            <card_1.CardTitle>Course Information</card_1.CardTitle>
                        </card_1.CardHeader>
                        <card_1.CardContent className="space-y-6">
                            <div className="space-y-2">
                                <label_1.Label>Course Title</label_1.Label>
                                <input_1.Input value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)}/>
                            </div>

                            <div className="space-y-2">
                                <label_1.Label>Description</label_1.Label>
                                <textarea_1.Textarea value={courseDescription} onChange={(e) => setCourseDescription(e.target.value)} className="min-h-[150px]"/>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label_1.Label>Price ($)</label_1.Label>
                                    <input_1.Input type="number" value={coursePrice} onChange={(e) => setCoursePrice(parseFloat(e.target.value))}/>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label_1.Label>Course Thumbnail</label_1.Label>
                                <FileUpload_1.default onUploadComplete={(url) => setCourseThumbnail(url)} currentUrl={courseThumbnail} label="Thumbnail Image"/>
                                <p className="text-xs text-muted-foreground">
                                    Update your course thumbnail. Recommended size: 1280x720.
                                </p>
                            </div>

                            <div className="pt-4">
                                <button_1.Button onClick={handleUpdateSettings} disabled={isSavingSettings} className="w-full lg:w-auto">
                                    {isSavingSettings ? "Saving..." : "Save All Changes"}
                                </button_1.Button>
                            </div>
                        </card_1.CardContent>
                    </card_1.Card>
                </tabs_1.TabsContent>
            </tabs_1.Tabs>

            {/* Edit Lesson Modal */}
            <dialog_1.Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <dialog_1.DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                    <dialog_1.DialogHeader>
                        <dialog_1.DialogTitle>Edit Lesson: {editingLesson?.title}</dialog_1.DialogTitle>
                        <dialog_1.DialogDescription>
                            Choose the content type and add your materials.
                        </dialog_1.DialogDescription>
                    </dialog_1.DialogHeader>

                    <div className="grid gap-4 py-4 flex-1 overflow-y-auto">

                        {/* Type Selection */}
                        <div className="flex gap-4 justify-center pb-4 border-b">
                            <button_1.Button type="button" variant={editType === 'VIDEO' ? 'default' : 'outline'} onClick={() => setEditType('VIDEO')} className="flex-1">
                                <lucide_react_1.Video className="w-4 h-4 mr-2"/> Video
                            </button_1.Button>
                            <button_1.Button type="button" variant={editType === 'TEXT' ? 'default' : 'outline'} onClick={() => setEditType('TEXT')} className="flex-1">
                                <lucide_react_1.FileText className="w-4 h-4 mr-2"/> Text/Article
                            </button_1.Button>
                            <button_1.Button type="button" variant={editType === 'QUIZ' ? 'default' : 'outline'} onClick={() => setEditType('QUIZ')} className="flex-1">
                                <lucide_react_1.CheckSquare className="w-4 h-4 mr-2"/> Quiz
                            </button_1.Button>
                            <button_1.Button type="button" variant={editType === 'ASSIGNMENT' ? 'default' : 'outline'} onClick={() => setEditType('ASSIGNMENT')} className="flex-1">
                                <lucide_react_1.FileUp className="w-4 h-4 mr-2"/> Assignment
                            </button_1.Button>
                        </div>

                        {/* Editors based on Type */}
                        {editType === 'VIDEO' && (<VideoUpload_1.default currentUrl={editVideoUrl} onUploadComplete={(url) => setEditVideoUrl(url)}/>)}

                        {editType === 'TEXT' && (<div className="flex flex-col gap-2 h-full">
                                <label_1.Label>Lesson Content (Markdown)</label_1.Label>
                                <textarea_1.Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="flex-1 min-h-[300px] font-mono" placeholder="# Lesson Title\n\nWrite your lesson content here..."/>
                            </div>)}

                        {editType === 'QUIZ' && editingLesson && (<QuizBuilder_1.default lessonId={editingLesson.id} onClose={() => setIsEditDialogOpen(false)}/>)}

                        {editType === 'ASSIGNMENT' && editingLesson && (<AssignmentBuilder_1.default lessonId={editingLesson.id} onClose={() => setIsEditDialogOpen(false)}/>)}

                    </div>

                    <dialog_1.DialogFooter>
                        {/* If Quiz or Assignment, the save is handled inside, but we still might want to save the type change via "Save Meta" */}
                        {(editType !== 'QUIZ' && editType !== 'ASSIGNMENT') && (<button_1.Button onClick={saveLessonDetails}>Save Changes</button_1.Button>)}
                        {(editType === 'QUIZ' || editType === 'ASSIGNMENT') && (<div className="text-xs text-muted-foreground mr-auto flex items-center">
                                Tip: Save content inside the builder.
                                Click "Update Lesson Type" to ensure the lesson is marked correctly.
                                <button_1.Button size="sm" variant="secondary" className="ml-4" onClick={saveLessonDetails}>
                                    Update Lesson Type
                                </button_1.Button>
                            </div>)}
                    </dialog_1.DialogFooter>
                </dialog_1.DialogContent>
            </dialog_1.Dialog>
        </div>);
}
