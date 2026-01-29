import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface Question {
    id: string;
    text: string;
    options: string[];
}

interface QuizData {
    id: string;
    questions: Question[];
}

interface QuizPlayerProps {
    lessonId: string;
    onComplete?: () => void;
}

export default function QuizPlayer({ lessonId, onComplete }: QuizPlayerProps) {
    const [quiz, setQuiz] = useState<QuizData | null>(null);
    const [answers, setAnswers] = useState<{ [key: string]: number }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{ score: number; passed: boolean; correctCount: number; total: number } | null>(null);

    useEffect(() => {
        setResult(null);
        setAnswers({});
        fetchQuiz();
    }, [lessonId]);

    const fetchQuiz = async () => {
        setIsLoading(true);
        try {
            const res = await api.get(`/quizzes/lesson/${lessonId}`);
            if (res.data.data.quiz) {
                setQuiz(res.data.data.quiz);
            } else {
                setQuiz(null); // No quiz found for this lesson
            }
        } catch (error) {
            console.error("Failed to fetch quiz", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptionSelect = (questionId: string, optionIndex: number) => {
        if (result) return; // Disable if already submitted
        setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    };

    const handleSubmit = async () => {
        if (!quiz) return;
        setIsSubmitting(true);
        try {
            // Transform answers to map question ID to index
            // Actually our state is already { [qId]: index }

            const res = await api.post(`/quizzes/${quiz.id}/attempt`, { answers });
            const data = res.data.data;

            setResult({
                score: data.attempt.score,
                passed: data.attempt.passed,
                correctCount: data.correctCount,
                total: data.totalQuestions
            });

            if (data.attempt.passed && onComplete) {
                onComplete();
            }

        } catch (error) {
            console.error("Failed to submit quiz", error);
            alert("Failed to submit quiz.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading Quiz...</div>;
    if (!quiz || quiz.questions.length === 0) return <div className="p-8 text-center">No questions in this quiz.</div>;

    return (
        <div className="max-w-3xl mx-auto p-4 space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Lesson Quiz</h2>
                <p className="text-muted-foreground">Test your knowledge to complete this lesson.</p>
            </div>

            {/* Questions List */}
            <div className="space-y-8">
                {quiz.questions.map((q, index) => (
                    <Card key={q.id} className="border-l-4 border-l-primary">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {index + 1}. {q.text}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={answers[q.id]?.toString()}
                                onValueChange={(val: string) => handleOptionSelect(q.id, parseInt(val))}
                                disabled={!!result}
                            >
                                {q.options.map((opt, optIndex) => (
                                    <div key={optIndex} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50 transition-colors">
                                        <RadioGroupItem value={optIndex.toString()} id={`q${q.id}-opt${optIndex}`} />
                                        <Label htmlFor={`q${q.id}-opt${optIndex}`} className="flex-1 cursor-pointer font-normal">
                                            {opt}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Result or Submit */}
            <div className="sticky bottom-4 bg-background/80 backdrop-blur p-4 border rounded-lg shadow-lg flex items-center justify-between">
                {result ? (
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                            {result.passed ? (
                                <CheckCircle2 className="h-10 w-10 text-green-500" />
                            ) : (
                                <XCircle className="h-10 w-10 text-red-500" />
                            )}
                            <div>
                                <h3 className={`font-bold text-lg ${result.passed ? "text-green-600" : "text-red-600"}`}>
                                    {result.passed ? "Passed!" : "Failed"}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    You scored {Math.round(result.score)}% ({result.correctCount}/{result.total})
                                </p>
                            </div>
                        </div>

                        {!result.passed && (
                            <Button onClick={() => { setResult(null); setAnswers({}); window.scrollTo(0, 0); }}>
                                Retry Quiz
                            </Button>
                        )}
                        {result.passed && (
                            <Button variant="outline" disabled>
                                Completed
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="flex justify-end w-full">
                        <div className="mr-auto content-center flex items-center text-sm text-muted-foreground">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Answer all questions to submit.
                        </div>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || Object.keys(answers).length < quiz.questions.length}
                            size="lg"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Answers"}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
