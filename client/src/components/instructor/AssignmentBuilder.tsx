import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/services/api";
import { Loader2, Save } from "lucide-react";

interface AssignmentBuilderProps {
    lessonId: string;
    onClose?: () => void;
}

export default function AssignmentBuilder({ lessonId, onClose }: AssignmentBuilderProps) {
    const [title, setTitle] = useState("");
    const [instructions, setInstructions] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchAssignment();
    }, [lessonId]);

    const fetchAssignment = async () => {
        setIsLoading(true);
        try {
            const res = await api.get(`/assignments/lesson/${lessonId}`);
            if (res.data.data.assignment) {
                setTitle(res.data.data.assignment.title);
                setInstructions(res.data.data.assignment.instructions);
            }
        } catch (error) {
            console.error("Failed to fetch assignment", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.put(`/assignments/lesson/${lessonId}`, {
                title,
                instructions
            });
            // alert("Assignment saved!");
            if (onClose) onClose();
        } catch (error) {
            console.error("Failed to save assignment", error);
            alert("Failed to save assignment.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <Card className="border-none shadow-none">
            <CardContent className="space-y-4 p-0">
                <div className="space-y-2">
                    <Label>Assignment Title</Label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Final Project Submission"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Instructions</Label>
                    <Textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Explain what the student needs to do..."
                        className="min-h-[200px]"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                        ) : (
                            <><Save className="w-4 h-4 mr-2" /> Save Assignment</>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
