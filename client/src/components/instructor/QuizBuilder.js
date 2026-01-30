"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QuizBuilder;
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const textarea_1 = require("@/components/ui/textarea");
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
const api_1 = require("@/services/api");
function QuizBuilder({ lessonId, onClose }) {
    const [questions, setQuestions] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [isSaving, setIsSaving] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        fetchQuiz();
    }, [lessonId]);
    const fetchQuiz = async () => {
        try {
            const res = await api_1.api.get(`/quizzes/lesson/${lessonId}`);
            if (res.data.data.quiz && res.data.data.quiz.questions) {
                setQuestions(res.data.data.quiz.questions);
            }
        }
        catch (error) {
            console.error("Failed to fetch quiz", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            {
                text: "New Question",
                options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                correctOptionIndex: 0,
                correctDetails: ""
            }
        ]);
    };
    const handleRemoveQuestion = (index) => {
        const newQ = [...questions];
        newQ.splice(index, 1);
        setQuestions(newQ);
    };
    const updateQuestion = (index, field, value) => {
        const newQ = [...questions];
        newQ[index] = { ...newQ[index], [field]: value };
        setQuestions(newQ);
    };
    const updateOption = (qIndex, oIndex, value) => {
        const newQ = [...questions];
        const newOptions = [...newQ[qIndex].options];
        newOptions[oIndex] = value;
        newQ[qIndex].options = newOptions;
        setQuestions(newQ);
    };
    const saveQuiz = async () => {
        setIsSaving(true);
        try {
            await api_1.api.post(`/quizzes/lesson/${lessonId}`, { questions });
            alert("Quiz saved successfully!");
            onClose();
        }
        catch (error) {
            console.error("Failed to save quiz", error);
            alert("Failed to save quiz.");
        }
        finally {
            setIsSaving(false);
        }
    };
    if (isLoading)
        return <div>Loading Quiz...</div>;
    return (<div className="space-y-6">
            <div className="max-h-[60vh] overflow-y-auto space-y-6 pr-2">
                {questions.map((q, qIndex) => (<card_1.Card key={qIndex} className="relative">
                        <button_1.Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => handleRemoveQuestion(qIndex)}>
                            <lucide_react_1.Trash2 className="h-3 w-3"/>
                        </button_1.Button>
                        <card_1.CardHeader className="pb-2">
                            <label_1.Label>Question {qIndex + 1}</label_1.Label>
                            <input_1.Input value={q.text} onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)} className="font-medium"/>
                        </card_1.CardHeader>
                        <card_1.CardContent className="space-y-3">
                            <div className="space-y-2">
                                <label_1.Label className="text-xs text-muted-foreground">Options (Select correct answer)</label_1.Label>
                                {q.options.map((opt, oIndex) => (<div key={oIndex} className="flex items-center gap-2">
                                        <button className={`h-4 w-4 rounded-full border flex items-center justify-center ${q.correctOptionIndex === oIndex ? "bg-green-500 border-green-500" : "border-gray-300"}`} onClick={() => updateQuestion(qIndex, 'correctOptionIndex', oIndex)}>
                                            {q.correctOptionIndex === oIndex && <lucide_react_1.CheckCircle2 className="h-3 w-3 text-white"/>}
                                        </button>
                                        <input_1.Input value={opt} onChange={(e) => updateOption(qIndex, oIndex, e.target.value)} className="h-8 text-sm"/>
                                    </div>))}
                            </div>
                            <div>
                                <label_1.Label className="text-xs text-muted-foreground">Explanation (Optional)</label_1.Label>
                                <textarea_1.Textarea value={q.correctDetails || ""} onChange={(e) => updateQuestion(qIndex, 'correctDetails', e.target.value)} placeholder="Explain why this answer is correct..." className="h-16 text-sm resize-none"/>
                            </div>
                        </card_1.CardContent>
                    </card_1.Card>))}

                {questions.length === 0 && (<div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        No questions added yet.
                    </div>)}
            </div>

            <div className="flex justify-between pt-4 border-t">
                <button_1.Button variant="outline" onClick={handleAddQuestion}>
                    <lucide_react_1.Plus className="h-4 w-4 mr-2"/> Add Question
                </button_1.Button>
                <div className="gap-2 flex">
                    <button_1.Button variant="ghost" onClick={onClose}>Cancel</button_1.Button>
                    <button_1.Button onClick={saveQuiz} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Quiz"}
                    </button_1.Button>
                </div>
            </div>
        </div>);
}
