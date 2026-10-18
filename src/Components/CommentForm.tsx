import { useState } from "react";
import { Send } from "lucide-react";

export default function CommentForm({ onSubmit, loading = false }: { onSubmit: (content: string) => void; loading?: boolean }) {
  const [content, setContent] = useState("");
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) return;
    onSubmit(content.trim());
    setContent("");
  }
  return <form className="comment-form" onSubmit={submit}><input value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write a comment..." maxLength={500}/><button type="submit" disabled={loading || !content.trim()} aria-label="Send comment"><Send size={18}/></button></form>;
}
