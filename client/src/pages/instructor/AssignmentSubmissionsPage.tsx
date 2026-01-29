import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, ExternalLink, CheckCircle } from "lucide-react";

interface User {
    name: string;
    email: string;
    avatar?: string;
}

interface Submission {
    id: string;
    fileUrl: string;
    grade: number | null;
    feedback: string | null;
    createdAt: string;
    user: User;
}

interface Assignment {
    id: string;
    title: string;
    lessonId: string;
}

export default function AssignmentSubmissionsPage() {
    const { courseId } = useParams();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmissionsLoading, setIsSubmissionsLoading] = useState(false);

    // Grading state
    const [gradingId, setGradingId] = useState<string | null>(null);
    const [grade, setGrade] = useState<string>("");
    const [feedback, setFeedback] = useState<string>("");

    useEffect(() => {
        fetchAssignments();
    }, [courseId]);

    const fetchAssignments = async () => {
        setIsLoading(true);
        try {
            // We need an endpoint to get all assignments for a course.
            // Currently we only have /assignments/lesson/:lessonId.
            // Let's assume we can fetch the course and extract assignments from its lessons.
            const res = await api.get(`/courses/${courseId}`);
            const course = res.data.data.course;
            const foundAssignments: Assignment[] = [];

            course.sections.forEach((section: any) => {
                section.lessons.forEach((lesson: any) => {
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
        } catch (error) {
            console.error("Failed to fetch assignments", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedAssignmentId) {
            fetchSubmissions(selectedAssignmentId);
        }
    }, [selectedAssignmentId]);

    const fetchSubmissions = async (assignmentId: string) => {
        setIsSubmissionsLoading(true);
        try {
            const res = await api.get(`/assignments/${assignmentId}/submissions`);
            setSubmissions(res.data.data.submissions);
        } catch (error) {
            console.error("Failed to fetch submissions", error);
        } finally {
            setIsSubmissionsLoading(false);
        }
    };

    const handleGrade = async (submissionId: string) => {
        if (!grade) return;
        try {
            await api.patch(`/assignments/submissions/${submissionId}`, {
                grade: parseFloat(grade),
                feedback
            });
            // Update local state
            setSubmissions(submissions.map(s => s.id === submissionId ? { ...s, grade: parseFloat(grade), feedback } : s));
            setGradingId(null);
            setGrade("");
            setFeedback("");
        } catch (error) {
            console.error("Failed to grade submission", error);
            alert("Failed to save grade.");
        }
    };

    if (isLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

    return (
        <div className="container py-10 max-w-5xl">
            <div className="mb-8 flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/instructor/dashboard"><ArrowLeft className="w-5 h-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Assignment Submissions</h1>
                    <p className="text-muted-foreground">Review and grade student work.</p>
                </div>
            </div>

            {assignments.length === 0 ? (
                <div className="text-center py-20 border rounded-lg bg-muted/10">
                    <p>No assignments found in this course.</p>
                </div>
            ) : (
                <div className="grid gap-8 lg:grid-cols-[250px,1fr]">
                    {/* Assignment List */}
                    <div className="space-y-2">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Assignments</h2>
                        {assignments.map(a => (
                            <button
                                key={a.id}
                                onClick={() => setSelectedAssignmentId(a.id)}
                                className={`w-full text-left p-3 rounded-md text-sm transition-colors ${selectedAssignmentId === a.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                            >
                                {a.title}
                            </button>
                        ))}
                    </div>

                    {/* Submissions List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">
                                {assignments.find(a => a.id === selectedAssignmentId)?.title}
                            </h2>
                            <span className="text-sm text-muted-foreground">{submissions.length} Submissions</span>
                        </div>

                        {isSubmissionsLoading ? (
                            <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>
                        ) : submissions.length === 0 ? (
                            <div className="text-center py-10 border rounded-lg bg-muted/5">
                                <p className="text-muted-foreground">No submissions yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {submissions.map(submission => (
                                    <Card key={submission.id}>
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                                                    {submission.user.avatar ? (
                                                        <img src={submission.user.avatar} alt={submission.user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground">
                                                            {submission.user.name[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base">{submission.user.name}</CardTitle>
                                                    <p className="text-xs text-muted-foreground">{submission.user.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {submission.grade !== null ? (
                                                    <div className="flex items-center gap-2 text-green-600 font-bold">
                                                        <CheckCircle className="w-4 h-4" />
                                                        {submission.grade}/100
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-semibold px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">Pending</span>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-muted-foreground">Submitted on {new Date(submission.createdAt).toLocaleDateString()}</p>
                                                <Button size="sm" variant="outline" asChild>
                                                    <a href={submission.fileUrl} target="_blank" rel="noreferrer">
                                                        <ExternalLink className="w-4 h-4 mr-2" /> View Work
                                                    </a>
                                                </Button>
                                            </div>

                                            {gradingId === submission.id ? (
                                                <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-bold">Grade (0-100)</label>
                                                            <Input
                                                                type="number"
                                                                value={grade}
                                                                onChange={(e) => setGrade(e.target.value)}
                                                                max="100" min="0"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold">Feedback</label>
                                                        <Textarea
                                                            value={feedback}
                                                            onChange={(e) => setFeedback(e.target.value)}
                                                            placeholder="Add helpful notes for the student..."
                                                        />
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => setGradingId(null)}>Cancel</Button>
                                                        <Button size="sm" onClick={() => handleGrade(submission.id)}>Save Grade</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between items-start gap-4">
                                                    {submission.feedback && (
                                                        <div className="flex-1 bg-muted/20 p-3 rounded-md text-sm italic">
                                                            "{submission.feedback}"
                                                        </div>
                                                    )}
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => {
                                                            setGradingId(submission.id);
                                                            setGrade(submission.grade?.toString() || "");
                                                            setFeedback(submission.feedback || "");
                                                        }}
                                                    >
                                                        {submission.grade !== null ? 'Edit Grade' : 'Grade Now'}
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
