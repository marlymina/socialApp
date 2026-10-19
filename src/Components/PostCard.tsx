import { useState } from "react";
import {
  Share2,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  ExternalLink,
  Bookmark,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Post } from "../Interfaces/Post";
import type { User } from "../Interfaces/User";
import { useAuth } from "../Context/useAuth";
import { usePosts } from "../Hooks/usePosts";

interface Props {
  post: Post;
  onLike: (postId: string) => void;
  onDelete: (post: Post) => void;
  onEdit: (post: Post) => void;
  onBookmark?: (postId: string) => void;
  saved?: boolean;
  liking?: boolean;
}

const SHARE_MARKER = "---SHARED_POST---";

export function getPostId(post: Post) {
  return String(post._id || post.id || "");
}

export function getPostOwner(post: Post) {
  return post.postCreator || post.user || post.userId || {};
}

function personInfo(person: unknown) {
  const data =
    typeof person === "object" && person !== null ? (person as User) : null;
  const name = data?.name || data?.userName || data?.username || "Route member";
  return {
    id: typeof person === "string" ? person : String(data?._id || data?.id || ""),
    name,
    username: data?.userName || data?.username || "member",
    photo:
      data?.photo ||
      data?.image ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e4efff&color=0b3b9c`,
  };
}

interface SharedView {
  id: string;
  name: string;
  username: string;
  photo: string;
  content: string;
  image: string;
}

function getSharedView(post: Post): {
  comment: string;
  sourceId: string;
  shared: SharedView | null;
} {
  const rawBody = post.body || post.content || "";
  const source = [post.sharedPost, post.originalPost].find(
    (item) => typeof item === "object" && item !== null,
  ) as Post | undefined;

  if (source) {
    const author = personInfo(getPostOwner(source));
    return {
      comment: rawBody,
      sourceId: getPostId(source),
      shared: {
        id: getPostId(source),
        name: author.name,
        username: author.username,
        photo: author.photo,
        content: source.body || source.content || "",
        image: source.image || "",
      },
    };
  }

  const sharedId =
    typeof post.sharedPost === "string" && post.sharedPost
      ? post.sharedPost
      : typeof post.originalPost === "string" && post.originalPost
        ? post.originalPost
        : "";

  if (sharedId) {
    const author = personInfo(null);
    return {
      comment: rawBody,
      sourceId: sharedId,
      shared: {
        id: sharedId,
        name: "Original post",
        username: "member",
        photo: author.photo,
        content: "Open the original post to see it.",
        image: "",
      },
    };
  }

  if (rawBody.includes(SHARE_MARKER)) {
    const parts = rawBody.split(SHARE_MARKER);
    const comment = parts[0]?.trim() || "";
    const jsonStr = (parts[1] || "").trim();
    const fallback = personInfo(getPostOwner(post));
    try {
      const meta = JSON.parse(jsonStr);
      return {
        comment,
        sourceId: "",
        shared: {
          id: getPostId(post),
          name: meta.name || fallback.name,
          username: meta.username || "member",
          photo: meta.photo || fallback.photo,
          content: meta.content || "",
          image: "",
        },
      };
    } catch {
      return {
        comment,
        sourceId: "",
        shared: {
          id: getPostId(post),
          name: fallback.name,
          username: fallback.username,
          photo: fallback.photo,
          content: jsonStr,
          image: "",
        },
      };
    }
  }

  return { comment: rawBody, sourceId: "", shared: null };
}

export default function PostCard({
  post,
  onLike,
  onDelete,
  onEdit,
  onBookmark,
  saved = false,
  liking = false,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareComment, setShareComment] = useState("");
  const { user } = useAuth();
  const { shareMutation } = usePosts();

  const owner = personInfo(getPostOwner(post));
  const postId = getPostId(post);
  const currentId = String(user?._id || user?.id || "");
  const isOwner = Boolean(currentId && owner.id && currentId === owner.id);
  const likes = Array.isArray(post.likes) ? post.likes : [];
  const liked = likes.some(
    (item) =>
      String(
        typeof item === "string"
          ? item
          : (item as unknown as { _id?: string })._id,
      ) === currentId,
  );

  const rawBody = post.body || post.content || "";
  const { comment, sourceId, shared } = getSharedView(post);

  const commentsCount =
    post.commentsCount ?? (Array.isArray(post.comments) ? post.comments.length : 0);
  const sharesCount =
    post.sharesCount ??
    post.shareCount ??
    (Array.isArray(post.shares) ? post.shares.length : 0);

  const preview = shared || {
    id: postId,
    name: owner.name,
    username: owner.username,
    photo: owner.photo,
    content: rawBody,
    image: post.image || "",
  };

  function handleShareSubmit() {
    shareMutation.mutate(
      { id: sourceId || postId, body: shareComment.trim() },
      {
        onSuccess: () => {
          setShareModalOpen(false);
          setShareComment("");
        },
      },
    );
  }

  return (
    <>
      <article className="post-card card">
        <div className="post-heading">
          <Link to={`/profile/${owner.id}`} className="post-author">
            <img src={owner.photo} alt={owner.name} />
            <span>
              <strong>{owner.name}</strong>
              <small>
                {post.createdAt
                  ? new Date(post.createdAt).toLocaleString()
                  : "Recently"}
              </small>
            </span>
          </Link>
          <div className="post-menu-wrap">
            <button
              className="icon-button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Post options"
            >
              <MoreHorizontal />
            </button>
            {menuOpen && (
              <div className="dropdown-menu">
                {isOwner && (
                  <button
                    onClick={() => {
                      onEdit(post);
                      setMenuOpen(false);
                    }}
                  >
                    <Pencil size={16} /> Edit post
                  </button>
                )}
                {isOwner && (
                  <button
                    className="dropdown-danger"
                    onClick={() => {
                      onDelete(post);
                      setMenuOpen(false);
                    }}
                  >
                    <Trash2 size={16} /> Delete post
                  </button>
                )}
                {onBookmark && (
                  <button
                    onClick={() => {
                      onBookmark(postId);
                      setMenuOpen(false);
                    }}
                  >
                    <Bookmark size={16} fill={saved ? "currentColor" : "none"} />{" "}
                    {saved ? "Unsave post" : "Save post"}
                  </button>
                )}
                <button
                  onClick={() => {
                    setShareModalOpen(true);
                    setMenuOpen(false);
                  }}
                >
                  <Share2 size={16} /> Share post
                </button>
              </div>
            )}
          </div>
        </div>

        {shared ? (
          <div className="space-y-3">
            {comment !== "" && <p className="post-body">{comment}</p>}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={shared.photo}
                    alt={shared.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <strong className="text-xs text-slate-800 block">
                      {shared.name}
                    </strong>
                    <small className="text-[10px] text-slate-500">
                      @{shared.username}
                    </small>
                  </div>
                </div>
                <Link
                  to={`/posts/${shared.id || postId}`}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  Original Post <ExternalLink size={12} />
                </Link>
              </div>
              {shared.content && (
                <p className="text-xs text-slate-700 whitespace-pre-wrap">
                  {shared.content}
                </p>
              )}
              {shared.image && (
                <img
                  className="post-image"
                  src={shared.image}
                  alt="Post attachment"
                />
              )}
            </div>
          </div>
        ) : (
          <>
            {rawBody && <p className="post-body">{rawBody}</p>}
            {post.image && (
              <img
                className="post-image"
                src={post.image}
                alt="Post attachment"
              />
            )}
          </>
        )}

        <div className="post-stats">
          <span>
            <Heart size={15} /> {likes.length} likes
          </span>
          <Link to={`/posts/${postId}`}>{commentsCount} comments</Link>
          <span>
            <Share2 size={15} /> {sharesCount} shares
          </span>
        </div>
        <div className="post-actions">
          <button
            className={liked ? "post-action active-like" : "post-action"}
            disabled={liking}
            onClick={() => onLike(postId)}
          >
            <Heart size={19} fill={liked ? "currentColor" : "none"} /> Like
          </button>
          <Link className="post-action" to={`/posts/${postId}`}>
            <MessageCircle size={19} /> Comment
          </Link>
          <button
            className="post-action"
            onClick={() => setShareModalOpen(true)}
          >
            <Share2 size={19} /> Share
          </button>
        </div>
        {post.topComment && (
          <div className="top-comment">
            <strong>Top comment</strong>
            <p>{post.topComment.content || post.topComment.comment}</p>
          </div>
        )}
      </article>

      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Share post</h3>
              <button
                onClick={() => setShareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <textarea
                value={shareComment}
                onChange={(e) => setShareComment(e.target.value)}
                placeholder="Say something about this..."
                className="w-full p-3 border border-slate-200 rounded-xl resize-none h-28 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <img
                    src={preview.photo}
                    alt={preview.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {preview.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      @{preview.username}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {preview.content}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setShareModalOpen(false)}
                className="px-5 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handleShareSubmit}
                disabled={shareMutation.isPending}
                className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 text-sm transition disabled:opacity-50"
              >
                {shareMutation.isPending ? "Sharing..." : "Share now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
