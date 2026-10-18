import { useState } from "react";
import {
  Bookmark,
  Globe2,
  Newspaper,
  Search,
  Sparkles,
  Users,
  UserPlus,
  UserCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import PostForm from "../Components/PostForm";
import PostCard from "../Components/PostCard";
import DeleteConfirmation from "../Components/DeleteConfirmation";
import type { Post } from "../Interfaces/Post";
import { getPostId, getPostOwner } from "../Components/PostCard";
import { usePosts } from "../Hooks/usePosts";
import { useSaved } from "../Hooks/useSaved";
import { useAuth } from "../Context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../Services/api";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function Home() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {
    posts,
    postsQuery,
    createMutation,
    updateMutation,
    deleteMutation,
    likeMutation,
    bookmarkMutation,
  } = usePosts();
  const { isSaved } = useSaved();
  const [deleting, setDeleting] = useState<Post | null>(null);
  const [editing, setEditing] = useState<Post | null>(null);
  const [search, setSearch] = useState("");
  const [friendSearch, setFriendSearch] = useState("");

  const suggestionsQuery = useQuery({
    queryKey: ["suggestions"],
    queryFn: async () => {
      const response = await api.get("/users/suggestions?page=1&limit=5");
      const data = response.data?.data;
      return Array.isArray(data)
        ? data
        : data?.suggestions || data?.users || [];
    },
  });

  const followMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.put(
        `/users/${userId}/follow`,
        {},
        {
          headers: { token: localStorage.getItem("token") || "" },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["community"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Updated follow status");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update follow status",
      );
    },
  });

  const searching = friendSearch.trim().length > 0;
  const currentUserId = String(user?._id || user?.id || "");

  const searchPoolQuery = useQuery({
    queryKey: ["suggestions", "pool"],
    queryFn: async () => {
      const pages = await Promise.allSettled(
        [1, 2, 3].map((page) =>
          api.get(`/users/suggestions?page=${page}&limit=30`),
        ),
      );
      return pages.flatMap((result) => {
        if (result.status !== "fulfilled") return [];
        const data = result.value.data?.data;
        return Array.isArray(data)
          ? data
          : data?.suggestions || data?.users || [];
      });
    },
    enabled: searching,
  });

  const postAuthors = posts
    .map((post) => getPostOwner(post))
    .filter(
      (owner) =>
        typeof owner === "object" &&
        owner !== null &&
        Boolean((owner as any)._id || (owner as any).id),
    );

  const friendPool: any[] = searching
    ? [
        ...(searchPoolQuery.data || []),
        ...(suggestionsQuery.data || []),
        ...postAuthors,
      ]
    : suggestionsQuery.data || [];

  const seenFriends = new Set<string>();
  const shownFriends = friendPool.filter((friend: any) => {
    const id = String(friend?._id || friend?.id || "");
    if (!id || id === currentUserId || seenFriends.has(id)) return false;
    seenFriends.add(id);
    if (!searching) return true;
    return `${friend.name || ""} ${friend.userName || friend.username || ""}`
      .toLowerCase()
      .includes(friendSearch.trim().toLowerCase());
  });

  const visiblePosts = posts.filter((post) =>
    `${post.body || post.content || ""} ${post.postCreator?.name || post.user?.name || ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <>
      <Helmet>
        <title>Feed | Route Posts</title>
        <meta
          name="description"
          content="See the latest posts from your Route Posts community."
        />
      </Helmet>
      <div className="feed-layout">
        <aside className="left-sidebar card">
          <Link className="side-link selected" to="/">
            <Newspaper size={20} /> Feed
          </Link>
          <Link className="side-link" to="/profile">
            <Sparkles size={20} /> My Posts
          </Link>
          <Link className="side-link" to="/community">
            <Globe2 size={20} /> Community
          </Link>
          <Link className="side-link" to="/saved">
            <Bookmark size={20} /> Saved
          </Link>
        </aside>
        <section className="feed-column">
          <div className="mobile-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search posts..."
            />
          </div>
          {editing ? (
            <PostForm
              initialBody={editing.body || editing.content || ""}
              buttonText="Save changes"
              loading={updateMutation.isPending}
              onCancel={() => setEditing(null)}
              onSubmit={(body, image) => {
                updateMutation.mutate({ id: getPostId(editing), body, image });
                setEditing(null);
              }}
            />
          ) : (
            <PostForm
              loading={createMutation.isPending}
              onSubmit={(body, image) => createMutation.mutate({ body, image })}
            />
          )}
          <div className="feed-heading">
            <h2>Latest posts</h2>
            <span>Stay connected with your community</span>
          </div>
          {postsQuery.isLoading ? (
            <div className="empty-state">Loading posts...</div>
          ) : postsQuery.isError ? (
            <div className="empty-state">
              Could not load posts. Please refresh the page.
            </div>
          ) : visiblePosts.length ? (
            visiblePosts.map((post) => (
              <PostCard
                key={getPostId(post)}
                post={post}
                onLike={(id) => likeMutation.mutate(id)}
                onDelete={setDeleting}
                onEdit={setEditing}
                onBookmark={(id) => bookmarkMutation.mutate(id)}
                saved={isSaved(getPostId(post))}
                liking={likeMutation.isPending}
              />
            ))
          ) : (
            <div className="empty-state">
              <span className="empty-icon">
                <Newspaper size={30} />
              </span>
              <h3>No posts yet</h3>
              <p>
                {search
                  ? "No posts match your search."
                  : "Be the first one to publish something."}
              </p>
            </div>
          )}
        </section>
        <aside className="right-sidebar card">
          <div className="sidebar-title">
            <h2>
              <Users size={20} /> Suggested Friends
            </h2>
            <span>{shownFriends.length}</span>
          </div>
          <div className="friend-search">
            <Search size={18} />
            <input
              placeholder="Search friends..."
              value={friendSearch}
              onChange={(event) => setFriendSearch(event.target.value)}
            />
          </div>
          {suggestionsQuery.isLoading ||
          (searching && searchPoolQuery.isLoading && !shownFriends.length) ? (
            <p className="muted">Loading friends...</p>
          ) : shownFriends.length ? (
            shownFriends.map((friend: any) => {
              const friendId = String(friend._id || friend.id || "");
              return (
                <div className="friend-card" key={friendId}>
                  <Link
                    to={`/profile/${friendId}`}
                    className="flex items-center gap-2 flex-grow overflow-hidden"
                  >
                    <img
                      src={
                        friend.photo ||
                        friend.image ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name || "Friend")}&background=e4efff&color=0b3b9c`
                      }
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="friend-info truncate">
                      <strong className="block truncate hover:underline text-slate-800">
                        {friend.name ||
                          friend.userName ||
                          friend.username ||
                          "Route member"}
                      </strong>
                      <small className="block truncate text-slate-500">
                        @{friend.userName || friend.username || "member"}
                      </small>
                      <small className="followers-count text-slate-400">
                        {friend.followersCount || 0} followers
                      </small>
                    </div>
                  </Link>
                  <button
                    onClick={() => followMutation.mutate(friendId)}
                    disabled={followMutation.isPending}
                    className={`follow-button flex items-center justify-center gap-1 ${
                      friend.isFollowing ? "bg-slate-100 text-slate-700" : ""
                    }`}
                  >
                    {friend.isFollowing ? (
                      <>
                        <UserCheck size={14} /> Following
                      </>
                    ) : (
                      <>
                        <UserPlus size={14} /> + Follow
                      </>
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            <p className="muted">
              {searching
                ? "No people match your search."
                : "No suggestions right now."}
            </p>
          )}
        </aside>
        {deleting && (
          <DeleteConfirmation
            title="Delete this post?"
            message="This post will be permanently removed from your profile and feed."
            confirmText="Delete post"
            onCancel={() => setDeleting(null)}
            onConfirm={() => {
              deleteMutation.mutate(getPostId(deleting));
              setDeleting(null);
            }}
            loading={deleteMutation.isPending}
          />
        )}
      </div>
    </>
  );
}
