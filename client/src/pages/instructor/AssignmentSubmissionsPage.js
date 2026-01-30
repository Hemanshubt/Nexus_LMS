"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AssignmentSubmissionsPage;
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const api_1 = require("@/services/api");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const input_1 = require("@/components/ui/input");
const textarea_1 = require("@/components/ui/textarea");
const lucide_react_1 = require("lucide-react");
function AssignmentSubmissionsPage() {
    const { courseId } = (0, react_router_dom_1.useParams)();
    const [assignments, setAssignments] = (0, react_1.useState)([]);
    const [selectedAssignmentId, setSelectedAssignmentId] = (0, react_1.useState)("");
    const [submissions, setSubmissions] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [isSubmissionsLoading, setIsSubmissionsLoading] = (0, react_1.useState)(false);
    // Grading state
    const [gradingId, setGradingId] = (0, react_1.useState)(null);
    const [grade, setGrade] = (0, react_1.useState)("");
    const [feedback, setFeedback] = (0, react_1.useState)("");
    (0, react_1.useEffect)(() => {
        fetchAssignments();
    }, [courseId]);
    const fetchAssignments = async () => {
        setIsLoading(true);
        try {
            // We need an endpoint to get all assignments for a course.
            // Currently we only have /assignments/lesson/:lessonId.
            // Let's assume we can fetch the course and extract assignments from its lessons.
            const res = await api_1.api.get(`/courses/${courseId}`);
            const course = res.data.data.course;
            const foundAssignments = [];
            course.sections.forEach((section) => {
                section.lessons.forEach((lesson) => {
                    if (lesson.type === 'ASSIGNMENT') {
                        foundAssignments.push({
                            id: lesson.assignment?.id || "",
                            title: lesson.title,
                            lessonId: lesson.id
                        });
                    }
                });
            });
            const filteredAssignments = foundAssignments.filter(a => a.id);
            setAssignments(filteredAssignments);
            if (filteredAssignments.length > 0) {
                setSelectedAssignmentId(filteredAssignments[0].id);
            }
        }
        catch (error) {
            console.error("Failed to fetch assignments", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        if (selectedAssignmentId) {
            fetchSubmissions(selectedAssignmentId);
        }
    }, [selectedAssignmentId]);
    const fetchSubmissions = async (assignmentId) => {
        setIsSubmissionsLoading(true);
        try {
            const res = await api_1.api.get(`/assignments/${assignmentId}/submissions`);
            setSubmissions(res.data.data.submissions);
        }
        catch (error) {
            console.error("Failed to fetch submissions", error);
        }
        finally {
            setIsSubmissionsLoading(false);
        }
    };
    const handleGrade = async (submissionId) => {
        if (!grade)
            return;
        try {
            await api_1.api.patch(`/assignments/submissions/${submissionId}`, {
                grade: parseFloat(grade),
                feedback
            });
            // Update local state
            setSubmissions(submissions.map(s => s.id === submissionId ? { ...s, grade: parseFloat(grade), feedback } : s));
            setGradingId(null);
            setGrade("");
            setFeedback("");
        }
        catch (error) {
            console.error("Failed to grade submission", error);
            alert("Failed to save grade.");
        }
    };
    if (isLoading)
        return <div className="p-10 text-center"><lucide_react_1.Loader2 className="animate-spin mx-auto"/></div>;
    return (<div className="container py-10 max-w-5xl">
            <div className="mb-8 flex items-center gap-4">
                <button_1.Button variant="ghost" size="icon" asChild>
                    <react_router_dom_1.Link to="/instructor/dashboard"><lucide_react_1.ArrowLeft className="w-5 h-5"/></react_router_dom_1.Link>
                </button_1.Button>
                <div>
                    <h1 className="text-3xl font-bold">Assignment Submissions</h1>
                    <p className="text-muted-foreground">Review and grade student work.</p>
                </div>
            </div>

            {assignments.length === 0 ? (<div className="text-center py-20 border rounded-lg bg-muted/10">
                    <p>No assignments found in this course.</p>
                </div>) : (<div className="grid gap-8 lg:grid-cols-[250px,1fr]">
                    {/* Assignment List */}
                    <div className="space-y-2">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Assignments</h2>
                        {assignments.map(a => (<button key={a.id} onClick={() => setSelectedAssignmentId(a.id)} className={`w-full text-left p-3 rounded-md text-sm transition-colors ${selectedAssignmentId === a.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                                {a.title}
                            </button>))}
                    </div>

                    {/* Submissions List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">
                                {assignments.find(a => a.id === selectedAssignmentId)?.title}
                            </h2>
                            <span className="text-sm text-muted-foreground">{submissions.length} Submissions</span>
                        </div>

                        {isSubmissionsLoading ? (<div className="p-10 text-center"><lucide_react_1.Loader2 className="animate-spin mx-auto"/></div>) : submissions.length === 0 ? (<div className="text-center py-10 border rounded-lg bg-muted/5">
                                <p className="text-muted-foreground">No submissions yet.</p>
                            </div>) : (<div className="space-y-4">
                                {submissions.map(submission => (<card_1.Card key={submission.id}>
                                        <card_1.CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                                                    {submission.user.avatar ? (<img src={submission.user.avatar} alt={submission.user.name} className="w-full h-full object-cover"/>) : (<div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground">
                                                            {submission.user.name[0]}
                                                        </div>)}
                                                </div>
                                                <div>
                                                    <card_1.CardTitle className="text-base">{submission.user.name}</card_1.CardTitle>
                                                    <p className="text-xs text-muted-foreground">{submission.user.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {submission.grade !== null ? (<div className="flex items-center gap-2 text-green-600 font-bold">
                                                        <lucide_react_1.CheckCircle className="w-4 h-4"/>
                                                        {submission.grade}/100
                                                    </div>) : (<span className="text-xs font-semibold px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">Pending</span>)}
                                            </div>
                                        </card_1.CardHeader>
                                        <card_1.CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-muted-foreground">Submitted on {new Date(submission.createdAt).toLocaleDateString()}</p>
                                                <button_1.Button size="sm" variant="outline" asChild>
                                                    <a href={submission.fileUrl} target="_blank" rel="noreferrer">
                                                        <lucide_react_1.ExternalLink className="w-4 h-4 mr-2"/> View Work
                                                    </a>
                                                </button_1.Button>
                                            </div>

                                            {gradingId === submission.id ? (<div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-bold">Grade (0-100)</label>
                                                            <input_1.Input type="number" value={grade} onChange={(e) => setGrade(e.target.value)} max="100" min="0"/>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold">Feedback</label>
                                                        <textarea_1.Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Add helpful notes for the student..."/>
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <button_1.Button variant="ghost" size="sm" onClick={() => setGradingId(null)}>Cancel</button_1.Button>
                                                        <button_1.Button size="sm" onClick={() => handleGrade(submission.id)}>Save Grade</button_1.Button>
                                                    </div>
                                                </div>) : (<div className="flex justify-between items-start gap-4">
                                                    {submission.feedback && (<div className="flex-1 bg-muted/20 p-3 rounded-md text-sm italic">
                                                            "{submission.feedback}"
                                                        </div>)}
                                                    <button_1.Button variant="secondary" size="sm" onClick={() => {
                            setGradingId(submission.id);
                            setGrade(submission.grade?.toString() || "");
                            setFeedback(submission.feedback || "");
                        }}>
                                                        {submission.grade !== null ? 'Edit Grade' : 'Grade Now'}
                                                    </button_1.Button>
                                                </div>)}
                                        </card_1.CardContent>
                                    </card_1.Card>))}
                            </div>)}
                    </div>
                </div>)}
        </div>);
}
