import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import api from "../Services/api";
import type { Post } from "../Interfaces/Post";
import type { Comment } from "../Interfaces/Comment";
import { useComments } from "../Hooks/useComments";
import CommentForm from "../Components/CommentForm";
import DeleteConfirmation from "../Components/DeleteConfirmation";
import { useAuth } from "../Context/useAuth";
import { Helmet } from "react-helmet-async";

export default function PostDetails() {
  const { postId = "" } = useParams();
  const { user } = useAuth();
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deleting, setDeleting] = useState<Comment | null>(null);
  const postQuery = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const response = await api.get(`/posts/${postId}`);
      return (response.data?.data?.post ||
        response.data?.data ||
        response.data?.post ||
        response.data) as Post;
    },
    enabled: Boolean(postId),
  });
  const { comments, commentsQuery, addMutation, editMutation, deleteMutation } =
    useComments(postId);
  if (postQuery.isLoading)
    return <div className="empty-state">Loading post...</div>;
  if (postQuery.isError || !postQuery.data)
    return <div className="empty-state">Post could not be found.</div>;
  const post = postQuery.data;
  const owner = post.postCreator || post.user || post.userId || {};
  const userId = String(user?._id || user?.id || "");
  return (
    <div className="details-layout">
      <Helmet>
        <title>Post details | Route Posts</title>
      </Helmet>
      <article className="post-card card">
        <div className="post-heading">
          <img
            className="avatar"
            src={
              owner.photo ||
              owner.image ||
              "https://ui-avatars.com/api/?name=User"
            }
            alt=""
          />
          <div>
            <strong>{owner.name || owner.userName || "Route member"}</strong>
            <small className="block-muted">
              {post.createdAt
                ? new Date(post.createdAt).toLocaleString()
                : "Recently"}
            </small>
          </div>
        </div>
        <p className="post-body">{post.body || post.content}</p>
        {post.image && (
          <img className="post-image" src={post.image} alt="Post attachment" />
        )}
      </article>
      <section className="comments-section card">
        <h2>
          Comments <span>{comments.length}</span>
        </h2>
        <CommentForm
          loading={addMutation.isPending}
          onSubmit={(content) => addMutation.mutate(content)}
        />
        {commentsQuery.isLoading ? (
          <p className="muted">Loading comments...</p>
        ) : comments.length ? (
          comments.map((comment) => {
            const commentOwner = comment.commentCreator || comment.user || {};
            const commentId = String(comment._id || comment.id || "");
            const isOwner =
              String(commentOwner._id || commentOwner.id || "") === userId;
            return (
              <div className="comment-item" key={commentId}>
                <img
                  src={
                    commentOwner.photo ||
                    commentOwner.image ||
                    "https://ui-avatars.com/api/?name=User"
                  }
                  alt=""
                />
                <div className="comment-content">
                  <strong>
                    {commentOwner.name ||
                      commentOwner.userName ||
                      "Route member"}
                  </strong>
                  {editing === commentId ? (
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        editMutation.mutate({
                          id: commentId,
                          content: editText,
                        });
                        setEditing(null);
                      }}
                    >
                      <input
                        value={editText}
                        onChange={(event) => setEditText(event.target.value)}
                      />
                      <button className="small-primary">Save</button>
                      <button
                        type="button"
                        className="small-secondary"
                        onClick={() => setEditing(null)}
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <p>{comment.content || comment.comment}</p>
                  )}
                  <small>
                    {comment.createdAt
                      ? new Date(comment.createdAt).toLocaleString()
                      : "Recently"}
                  </small>
                </div>
                {isOwner && (
                  <div className="comment-actions">
                    <button
                      className="icon-button"
                      onClick={() => {
                        setEditing(commentId);
                        setEditText(comment.content || comment.comment || "");
                      }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => setDeleting(comment)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="empty-comments">
            No comments yet. Start the conversation.
          </p>
        )}
        {commentsQuery.hasNextPage && (
          <button
            className="load-more"
            disabled={commentsQuery.isFetchingNextPage}
            onClick={() => commentsQuery.fetchNextPage()}
          >
            {commentsQuery.isFetchingNextPage
              ? "Loading..."
              : "Load more comments"}
          </button>
        )}
      </section>
      {deleting && (
        <DeleteConfirmation
          title="Delete comment?"
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            deleteMutation.mutate(String(deleting._id || deleting.id));
            setDeleting(null);
          }}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
