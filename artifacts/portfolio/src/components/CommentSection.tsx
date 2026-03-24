import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { MessageCircle, Send, Loader2, User } from "lucide-react";

interface Comment {
  id: string;
  name: string;
  text: string;
  createdAt: string;
}

export default function CommentSection({ postId }: { postId: string }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(() => localStorage.getItem("comment_name") || "");
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ["comments", postId],
    queryFn: () => apiFetch<Comment[]>(`/blog/${postId}/comments`),
    enabled: !!postId,
  });

  const mutation = useMutation({
    mutationFn: (payload: { name: string; text: string }) =>
      apiFetch<Comment>(`/blog/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      localStorage.setItem("comment_name", name);
      setText("");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: () => setError("Failed to post comment. Please try again."),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedText = text.trim();
    if (!trimmedName) { setError("Please enter your name"); return; }
    if (!trimmedText) { setError("Please enter a comment"); return; }
    setError("");
    mutation.mutate({ name: trimmedName, text: trimmedText });
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
      });
    } catch { return iso; }
  }

  return (
    <div className="mt-12 pt-10 border-t border-border">
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-display font-bold text-foreground">
          Comments {comments.length > 0 && <span className="text-muted-foreground text-lg font-normal">({comments.length})</span>}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-5 sm:p-6 mb-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="comment-name" className="block text-sm font-medium text-foreground mb-1.5">Your Name</label>
            <input
              id="comment-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              maxLength={100}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="comment-text" className="block text-sm font-medium text-foreground mb-1.5">Comment</label>
            <textarea
              id="comment-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your thoughts..."
              maxLength={2000}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition resize-y text-sm"
            />
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-60 transition"
          >
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {mutation.isPending ? "Posting…" : "Post Comment"}
          </button>
        </div>
      </form>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 bg-muted/30 rounded-2xl">
          <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</p>
                </div>
              </div>
              <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-line">{c.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
