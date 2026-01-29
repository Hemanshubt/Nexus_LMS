import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Trash2, Plus, CheckCircle2 } from "lucide-react";
import { api } from "@/services/api";

interface Question {
    id?: string; // Optional for new questions before save, though we might just treat all as new payload
    text: string;
    options: string[];
    correctOptionIndex: number;
    correctDetails?: string;
}

interface QuizBuilderProps {
    lessonId: string;
    onClose: () => void;
}

export default function QuizBuilder({ lessonId, onClose }: QuizBuilderProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchQuiz();
    }, [lessonId]);

    const fetchQuiz = async () => {
        try {
            const res = await api.get(`/quizzes/lesson/${lessonId}`);
            if (res.data.data.quiz && res.data.data.quiz.questions) {
                setQuestions(res.data.data.quiz.questions);
            }
        } catch (error) {
            console.error("Failed to fetch quiz", error);
        } finally {
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

    const handleRemoveQuestion = (index: number) => {
        const newQ = [...questions];
        newQ.splice(index, 1);
        setQuestions(newQ);
    };

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        const newQ = [...questions];
        newQ[index] = { ...newQ[index], [field]: value };
        setQuestions(newQ);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const newQ = [...questions];
        const newOptions = [...newQ[qIndex].options];
        newOptions[oIndex] = value;
        newQ[qIndex].options = newOptions;
        setQuestions(newQ);
    };

    const saveQuiz = async () => {
        setIsSaving(true);
        try {
            await api.post(`/quizzes/lesson/${lessonId}`, { questions });
            alert("Quiz saved successfully!");
            onClose();
        } catch (error) {
            console.error("Failed to save quiz", error);
            alert("Failed to save quiz.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div>Loading Quiz...</div>;

    return (
        <div className="space-y-6">
            <div className="max-h-[60vh] overflow-y-auto space-y-6 pr-2">
                {questions.map((q, qIndex) => (
                    <Card key={qIndex} className="relative">
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => handleRemoveQuestion(qIndex)}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                        <CardHeader className="pb-2">
                            <Label>Question {qIndex + 1}</Label>
                            <Input
                                value={q.text}
                                onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                                className="font-medium"
                            />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Options (Select correct answer)</Label>
                                {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} className="flex items-center gap-2">
                                        <button
                                            className={`h-4 w-4 rounded-full border flex items-center justify-center ${q.correctOptionIndex === oIndex ? "bg-green-500 border-green-500" : "border-gray-300"
                                                }`}
                                            onClick={() => updateQuestion(qIndex, 'correctOptionIndex', oIndex)}
                                        >
                                            {q.correctOptionIndex === oIndex && <CheckCircle2 className="h-3 w-3 text-white" />}
                                        </button>
                                        <Input
                                            value={opt}
                                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Explanation (Optional)</Label>
                                <Textarea
                                    value={q.correctDetails || ""}
                                    onChange={(e) => updateQuestion(qIndex, 'correctDetails', e.target.value)}
                                    placeholder="Explain why this answer is correct..."
                                    className="h-16 text-sm resize-none"
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {questions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        No questions added yet.
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={handleAddQuestion}>
                    <Plus className="h-4 w-4 mr-2" /> Add Question
                </Button>
                <div className="gap-2 flex">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={saveQuiz} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Quiz"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
