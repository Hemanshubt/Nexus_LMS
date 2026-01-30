"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LessonQA;
const react_1 = require("react");
const api_1 = require("@/services/api");
const button_1 = require("@/components/ui/button");
const textarea_1 = require("@/components/ui/textarea");
const avatar_1 = require("@/components/ui/avatar");
const lucide_react_1 = require("lucide-react");
const badge_1 = require("@/components/ui/badge");
const useAuthStore_1 = require("@/store/useAuthStore");
function LessonQA({ lessonId }) {
    const { user: currentUser } = (0, useAuthStore_1.useAuthStore)();
    const [comments, setComments] = (0, react_1.useState)([]);
    const [newComment, setNewComment] = (0, react_1.useState)("");
    const [replyTo, setReplyTo] = (0, react_1.useState)(null);
    const [replyText, setReplyText] = (0, react_1.useState)("");
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        fetchComments();
    }, [lessonId]);
    const fetchComments = async () => {
        try {
            const res = await api_1.api.get(`/comments/lesson/${lessonId}`);
            setComments(res.data.data.comments);
        }
        catch (error) {
            console.error("Failed to fetch comments", error);
        }
    };
    const handleSubmitComment = async () => {
        if (!newComment.trim())
            return;
        setIsLoading(true);
        try {
            await api_1.api.post('/comments', { text: newComment, lessonId });
            setNewComment("");
            fetchComments();
        }
        catch (error) {
            console.error("Failed to post comment", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleSubmitReply = async (parentId) => {
        if (!replyText.trim())
            return;
        try {
            await api_1.api.post('/comments', { text: replyText, lessonId, parentId });
            setReplyText("");
            setReplyTo(null);
            fetchComments();
        }
        catch (error) {
            console.error("Failed to post reply", error);
        }
    };
    const handleDelete = async (commentId) => {
        if (!confirm("Delete this comment?"))
            return;
        try {
            await api_1.api.delete(`/comments/${commentId}`);
            fetchComments();
        }
        catch (error) {
            console.error("Failed to delete comment", error);
        }
    };
    return (<div className="space-y-8 animate-in fade-in duration-500">
            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <lucide_react_1.MessageSquare className="w-5 h-5 text-primary"/>
                    Discussion
                </h3>

                <div className="bg-muted/30 p-4 rounded-xl space-y-3 border border-border/50">
                    <textarea_1.Textarea placeholder="Ask a question or share your thoughts..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="bg-background border-none focus-visible:ring-1 focus-visible:ring-primary h-24"/>
                    <div className="flex justify-end">
                        <button_1.Button onClick={handleSubmitComment} disabled={isLoading || !newComment.trim()} className="gap-2">
                            <lucide_react_1.Send className="w-4 h-4"/> Post Question
                        </button_1.Button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {comments.length === 0 ? (<div className="text-center py-10 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                        No discussions yet. Be the first to ask!
                    </div>) : (comments.map((comment) => (<div key={comment.id} className="group space-y-4">
                            <div className="flex gap-4">
                                <avatar_1.Avatar className="h-10 w-10 border-2 border-primary/10">
                                    <avatar_1.AvatarImage src={comment.user.avatar}/>
                                    <avatar_1.AvatarFallback>{comment.user.name.charAt(0)}</avatar_1.AvatarFallback>
                                </avatar_1.Avatar>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm">{comment.user.name}</span>
                                        {comment.user.role !== 'STUDENT' && (<badge_1.Badge variant="secondary" className="px-1.5 py-0 text-[10px] gap-1">
                                                <lucide_react_1.Shield className="w-3 h-3"/> INSTRUCTOR
                                            </badge_1.Badge>)}
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm leading-relaxed text-foreground/90">{comment.text}</p>

                                    <div className="flex items-center gap-4 pt-1">
                                        <button onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                                            <lucide_react_1.Reply className="w-3 h-3"/> Reply
                                        </button>
                                        {(currentUser?.id === comment.userId || currentUser?.role === 'ADMIN') && (<button onClick={() => handleDelete(comment.id)} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
                                                <lucide_react_1.Trash2 className="w-3 h-3"/> Delete
                                            </button>)}
                                    </div>

                                    {/* Reply Input */}
                                    {replyTo === comment.id && (<div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                            <textarea_1.Textarea placeholder="Write your reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} className="h-20 text-sm" autoFocus/>
                                            <div className="flex justify-end gap-2">
                                                <button_1.Button size="sm" variant="ghost" onClick={() => setReplyTo(null)}>Cancel</button_1.Button>
                                                <button_1.Button size="sm" onClick={() => handleSubmitReply(comment.id)}>Reply</button_1.Button>
                                            </div>
                                        </div>)}
                                </div>
                            </div>

                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (<div className="ml-12 space-y-4 border-l-2 border-muted pl-6">
                                    {comment.replies.map((reply) => (<div key={reply.id} className="flex gap-3">
                                            <avatar_1.Avatar className="h-8 w-8">
                                                <avatar_1.AvatarImage src={reply.user.avatar}/>
                                                <avatar_1.AvatarFallback>{reply.user.name.charAt(0)}</avatar_1.AvatarFallback>
                                            </avatar_1.Avatar>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-xs">{reply.user.name}</span>
                                                    {reply.user.role !== 'STUDENT' && (<badge_1.Badge variant="secondary" className="px-1 py-0 text-[8px] h-4">STAFF</badge_1.Badge>)}
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {new Date(reply.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-foreground/80">{reply.text}</p>
                                                {(currentUser?.id === reply.userId || currentUser?.role === 'ADMIN') && (<button onClick={() => handleDelete(reply.id)} className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1 mt-1">
                                                        <lucide_react_1.Trash2 className="w-2.5 h-2.5"/> Delete
                                                    </button>)}
                                            </div>
                                        </div>))}
                                </div>)}
                        </div>)))}
            </div>
        </div>);
}
