"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AssignmentBuilder;
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const textarea_1 = require("@/components/ui/textarea");
const card_1 = require("@/components/ui/card");
const api_1 = require("@/services/api");
const lucide_react_1 = require("lucide-react");
function AssignmentBuilder({ lessonId, onClose }) {
    const [title, setTitle] = (0, react_1.useState)("");
    const [instructions, setInstructions] = (0, react_1.useState)("");
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [isSaving, setIsSaving] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        fetchAssignment();
    }, [lessonId]);
    const fetchAssignment = async () => {
        setIsLoading(true);
        try {
            const res = await api_1.api.get(`/assignments/lesson/${lessonId}`);
            if (res.data.data.assignment) {
                setTitle(res.data.data.assignment.title);
                setInstructions(res.data.data.assignment.instructions);
            }
        }
        catch (error) {
            console.error("Failed to fetch assignment", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api_1.api.put(`/assignments/lesson/${lessonId}`, {
                title,
                instructions
            });
            // alert("Assignment saved!");
            if (onClose)
                onClose();
        }
        catch (error) {
            console.error("Failed to save assignment", error);
            alert("Failed to save assignment.");
        }
        finally {
            setIsSaving(false);
        }
    };
    if (isLoading)
        return <div className="p-4 flex justify-center"><lucide_react_1.Loader2 className="animate-spin"/></div>;
    return (<card_1.Card className="border-none shadow-none">
            <card_1.CardContent className="space-y-4 p-0">
                <div className="space-y-2">
                    <label_1.Label>Assignment Title</label_1.Label>
                    <input_1.Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Final Project Submission"/>
                </div>

                <div className="space-y-2">
                    <label_1.Label>Instructions</label_1.Label>
                    <textarea_1.Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Explain what the student needs to do..." className="min-h-[200px]"/>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <button_1.Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (<><lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/> Saving...</>) : (<><lucide_react_1.Save className="w-4 h-4 mr-2"/> Save Assignment</>)}
                    </button_1.Button>
                </div>
            </card_1.CardContent>
        </card_1.Card>);
}
