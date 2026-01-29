import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/services/api";
import { Loader2, CheckCircle2, FileText, AlertCircle } from "lucide-react";
import FileUpload from "@/components/common/FileUpload";

interface Assignment {
    id: string;
    title: string;
    instructions: string;
}

interface Submission {
    id: string;
    fileUrl: string;
    grade?: number;
    feedback?: string;
    createdAt: string;
}

interface AssignmentPlayerProps {
    lessonId: string;
    onComplete?: () => void;
}

export default function AssignmentPlayer({ lessonId, onComplete }: AssignmentPlayerProps) {
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadUrl, setUploadUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchAssignment();
    }, [lessonId]);

    const fetchAssignment = async () => {
        setIsLoading(true);
        try {
            const res = await api.get(`/assignments/lesson/${lessonId}`);
            setAssignment(res.data.data.assignment);
            setSubmission(res.data.data.submission);
        } catch (error) {
            console.error("Failed to fetch assignment", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!assignment || !uploadUrl) return;
        setIsSubmitting(true);
        try {
            const res = await api.post(`/assignments/${assignment.id}/submit`, { fileUrl: uploadUrl });
            setSubmission(res.data.data.submission);
            if (onComplete) onComplete();
        } catch (error) {
            console.error("Failed to submit assignment", error);
            alert("Failed to submit.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    if (!assignment) return <div className="p-8 text-center">Assignment not found.</div>;

    return (
        <div className="max-w-3xl mx-auto p-4 space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">{assignment.title || "Assignment"}</h2>
                <div className="prose prose-invert max-w-none bg-muted/30 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{assignment.instructions}</p>
                </div>
            </div>

            {submission ? (
                <Card className="border-green-500/50 bg-green-500/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-6 h-6" /> Submitted
                        </CardTitle>
                        <CardDescription>
                            You submitted this assignment on {new Date(submission.createdAt).toLocaleDateString()}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4" />
                            <a href={submission.fileUrl} target="_blank" rel="noreferrer" className="underline hover:text-primary">
                                View Your Submission
                            </a>
                        </div>

                        {submission.grade !== null && submission.grade !== undefined ? (
                            <div className="mt-4 p-4 bg-background rounded border">
                                <p className="font-bold">Grade: {submission.grade}/100</p>
                                {submission.feedback && (
                                    <div className="mt-2 text-sm text-muted-foreground">
                                        <strong>Feedback:</strong> {submission.feedback}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-yellow-600 mt-2">
                                <AlertCircle className="w-4 h-4" />
                                <span>Pending Review</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Submit Your Work</CardTitle>
                        <CardDescription>
                            Upload your completed file below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FileUpload
                            onUploadComplete={setUploadUrl}
                            currentUrl={uploadUrl}
                            label="Assignment File"
                        />
                        <div className="flex justify-end">
                            <Button onClick={handleSubmit} disabled={!uploadUrl || isSubmitting}>
                                {isSubmitting ? "Submitting..." : "Submit Assignment"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
