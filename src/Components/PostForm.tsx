import { useRef, useState } from "react";
import { ImagePlus, Smile, X, Send } from "lucide-react";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { useAuth } from "../Context/AuthContext";

interface Props {
  onSubmit: (body: string, image: File | null) => void;
  loading?: boolean;
  initialBody?: string;
  buttonText?: string;
  onCancel?: () => void;
}

export default function PostForm({ onSubmit, loading = false, initialBody = "", buttonText = "Post", onCancel }: Props) {
  const { user } = useAuth();
  const [body, setBody] = useState(initialBody);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  function chooseImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
  }
  function addEmoji(emoji: EmojiClickData) {
    setBody((value) => value + emoji.emoji);
    setShowEmoji(false);
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim() && !image) return;
    onSubmit(body.trim(), image);
    if (!initialBody) { setBody(""); setImage(null); setPreview(""); }
  }
  return <form className="composer card" onSubmit={submit}><div className="composer-user"><img src={user?.photo || user?.image || "https://ui-avatars.com/api/?name=User&background=0b3b9c&color=fff"} alt="Your profile"/><div><strong>{user?.name || user?.userName || "Your name"}</strong><span>Share with the community</span></div></div><textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder={`What's on your mind, ${user?.name?.split(" ")[0] || "friend"}?`} rows={4} maxLength={3000}/>{preview && <div className="image-preview"><img src={preview} alt="Post preview"/><button type="button" className="remove-image" onClick={() => { setImage(null); setPreview(""); if (inputRef.current) inputRef.current.value = ""; }}><X size={17}/></button></div>}<div className="composer-bottom"><div className="composer-tools"><button type="button" className="tool-button" onClick={() => inputRef.current?.click()}><ImagePlus size={19}/> Photo/video</button><input ref={inputRef} type="file" accept="image/*" hidden onChange={chooseImage}/><div className="emoji-wrap"><button type="button" className="tool-button" onClick={() => setShowEmoji((value) => !value)}><Smile size={19}/> Feeling/activity</button>{showEmoji && <div className="emoji-popover"><EmojiPicker onEmojiClick={addEmoji} height={350} width={300}/></div>}</div></div><div className="composer-actions">{onCancel && <button type="button" className="secondary-button" onClick={onCancel}>Cancel</button>}<button type="submit" disabled={loading || (!body.trim() && !image)}>{loading ? "Saving..." : buttonText}<Send size={17}/></button></div></div></form>;
}
