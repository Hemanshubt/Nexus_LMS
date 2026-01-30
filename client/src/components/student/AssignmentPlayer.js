"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AssignmentPlayer;
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const api_1 = require("@/services/api");
const lucide_react_1 = require("lucide-react");
const FileUpload_1 = __importDefault(require("@/components/common/FileUpload"));
function AssignmentPlayer({ lessonId, onComplete }) {
    const [assignment, setAssignment] = (0, react_1.useState)(null);
    const [submission, setSubmission] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [uploadUrl, setUploadUrl] = (0, react_1.useState)("");
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        fetchAssignment();
    }, [lessonId]);
    const fetchAssignment = async () => {
        setIsLoading(true);
        try {
            const res = await api_1.api.get(`/assignments/lesson/${lessonId}`);
            setAssignment(res.data.data.assignment);
            setSubmission(res.data.data.submission);
        }
        catch (error) {
            console.error("Failed to fetch assignment", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleSubmit = async () => {
        if (!assignment || !uploadUrl)
            return;
        setIsSubmitting(true);
        try {
            const res = await api_1.api.post(`/assignments/${assignment.id}/submit`, { fileUrl: uploadUrl });
            setSubmission(res.data.data.submission);
            if (onComplete)
                onComplete();
        }
        catch (error) {
            console.error("Failed to submit assignment", error);
            alert("Failed to submit.");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (isLoading)
        return <div className="p-8 flex justify-center"><lucide_react_1.Loader2 className="animate-spin"/></div>;
    if (!assignment)
        return <div className="p-8 text-center">Assignment not found.</div>;
    return (<div className="max-w-3xl mx-auto p-4 space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">{assignment.title || "Assignment"}</h2>
                <div className="prose prose-invert max-w-none bg-muted/30 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{assignment.instructions}</p>
                </div>
            </div>

            {submission ? (<card_1.Card className="border-green-500/50 bg-green-500/10">
                    <card_1.CardHeader>
                        <card_1.CardTitle className="flex items-center gap-2 text-green-600">
                            <lucide_react_1.CheckCircle2 className="w-6 h-6"/> Submitted
                        </card_1.CardTitle>
                        <card_1.CardDescription>
                            You submitted this assignment on {new Date(submission.createdAt).toLocaleDateString()}.
                        </card_1.CardDescription>
                    </card_1.CardHeader>
                    <card_1.CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm">
                            <lucide_react_1.FileText className="w-4 h-4"/>
                            <a href={submission.fileUrl} target="_blank" rel="noreferrer" className="underline hover:text-primary">
                                View Your Submission
                            </a>
                        </div>

                        {submission.grade !== null && submission.grade !== undefined ? (<div className="mt-4 p-4 bg-background rounded border">
                                <p className="font-bold">Grade: {submission.grade}/100</p>
                                {submission.feedback && (<div className="mt-2 text-sm text-muted-foreground">
                                        <strong>Feedback:</strong> {submission.feedback}
                                    </div>)}
                            </div>) : (<div className="flex items-center gap-2 text-sm text-yellow-600 mt-2">
                                <lucide_react_1.AlertCircle className="w-4 h-4"/>
                                <span>Pending Review</span>
                            </div>)}
                    </card_1.CardContent>
                </card_1.Card>) : (<card_1.Card>
                    <card_1.CardHeader>
                        <card_1.CardTitle>Submit Your Work</card_1.CardTitle>
                        <card_1.CardDescription>
                            Upload your completed file below.
                        </card_1.CardDescription>
                    </card_1.CardHeader>
                    <card_1.CardContent className="space-y-4">
                        <FileUpload_1.default onUploadComplete={setUploadUrl} currentUrl={uploadUrl} label="Assignment File"/>
                        <div className="flex justify-end">
                            <button_1.Button onClick={handleSubmit} disabled={!uploadUrl || isSubmitting}>
                                {isSubmitting ? "Submitting..." : "Submit Assignment"}
                            </button_1.Button>
                        </div>
                    </card_1.CardContent>
                </card_1.Card>)}
        </div>);
}
