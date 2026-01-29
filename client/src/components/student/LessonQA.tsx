import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, Reply, Trash2, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/useAuthStore";

interface User {
    name: string;
    avatar?: string;
    role: string;
}

interface Comment {
    id: string;
    text: string;
    userId: string;
    user: User;
    createdAt: string;
    replies?: Comment[];
}

interface LessonQAProps {
    lessonId: string;
}

export default function LessonQA({ lessonId }: LessonQAProps) {
    const { user: currentUser } = useAuthStore();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [lessonId]);

    const fetchComments = async () => {
        try {
            const res = await api.get(`/comments/lesson/${lessonId}`);
            setComments(res.data.data.comments);
        } catch (error) {
            console.error("Failed to fetch comments", error);
        }
    };

    const handleSubmitComment = async () => {
        if (!newComment.trim()) return;
        setIsLoading(true);
        try {
            await api.post('/comments', { text: newComment, lessonId });
            setNewComment("");
            fetchComments();
        } catch (error) {
            console.error("Failed to post comment", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitReply = async (parentId: string) => {
        if (!replyText.trim()) return;
        try {
            await api.post('/comments', { text: replyText, lessonId, parentId });
            setReplyText("");
            setReplyTo(null);
            fetchComments();
        } catch (error) {
            console.error("Failed to post reply", error);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm("Delete this comment?")) return;
        try {
            await api.delete(`/comments/${commentId}`);
            fetchComments();
        } catch (error) {
            console.error("Failed to delete comment", error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Discussion
                </h3>

                <div className="bg-muted/30 p-4 rounded-xl space-y-3 border border-border/50">
                    <Textarea
                        placeholder="Ask a question or share your thoughts..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="bg-background border-none focus-visible:ring-1 focus-visible:ring-primary h-24"
                    />
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSubmitComment}
                            disabled={isLoading || !newComment.trim()}
                            className="gap-2"
                        >
                            <Send className="w-4 h-4" /> Post Question
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {comments.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                        No discussions yet. Be the first to ask!
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="group space-y-4">
                            <div className="flex gap-4">
                                <Avatar className="h-10 w-10 border-2 border-primary/10">
                                    <AvatarImage src={comment.user.avatar} />
                                    <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm">{comment.user.name}</span>
                                        {comment.user.role !== 'STUDENT' && (
                                            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] gap-1">
                                                <Shield className="w-3 h-3" /> INSTRUCTOR
                                            </Badge>
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm leading-relaxed text-foreground/90">{comment.text}</p>

                                    <div className="flex items-center gap-4 pt-1">
                                        <button
                                            onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                                        >
                                            <Reply className="w-3 h-3" /> Reply
                                        </button>
                                        {(currentUser?.id === comment.userId || currentUser?.role === 'ADMIN') && (
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" /> Delete
                                            </button>
                                        )}
                                    </div>

                                    {/* Reply Input */}
                                    {replyTo === comment.id && (
                                        <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                            <Textarea
                                                placeholder="Write your reply..."
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                className="h-20 text-sm"
                                                autoFocus
                                            />
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => setReplyTo(null)}>Cancel</Button>
                                                <Button size="sm" onClick={() => handleSubmitReply(comment.id)}>Reply</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                                <div className="ml-12 space-y-4 border-l-2 border-muted pl-6">
                                    {comment.replies.map((reply) => (
                                        <div key={reply.id} className="flex gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={reply.user.avatar} />
                                                <AvatarFallback>{reply.user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-xs">{reply.user.name}</span>
                                                    {reply.user.role !== 'STUDENT' && (
                                                        <Badge variant="secondary" className="px-1 py-0 text-[8px] h-4">STAFF</Badge>
                                                    )}
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {new Date(reply.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-foreground/80">{reply.text}</p>
                                                {(currentUser?.id === reply.userId || currentUser?.role === 'ADMIN') && (
                                                    <button
                                                        onClick={() => handleDelete(reply.id)}
                                                        className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1 mt-1"
                                                    >
                                                        <Trash2 className="w-2.5 h-2.5" /> Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
