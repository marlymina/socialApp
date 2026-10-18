import { useAuth } from "../Context/AuthContext";
import { usePosts } from "../Hooks/usePosts";
import { useSaved } from "../Hooks/useSaved";
import PostCard, { getPostId } from "../Components/PostCard";
import { useState } from "react";
import type { Post } from "../Interfaces/Post";
import DeleteConfirmation from "../Components/DeleteConfirmation";
import { useParams } from "react-router-dom";
import { Mail, Users, Bookmark, FileText, Camera } from "lucide-react";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import api from "../Services/api";

export default function Profile() {
  const { user } = useAuth();
  const { userId } = useParams();
  const { posts, postsQuery, likeMutation, deleteMutation, bookmarkMutation } =
    usePosts();
  const { savedIds, isSaved } = useSaved();
  const [deleting, setDeleting] = useState<Post | null>(null);
  const [uploading, setUploading] = useState(false);
  const currentId = String(user?._id || user?.id || "");
  const targetUserId = userId || currentId;
  const ownProfile = !userId || userId === currentId;

  const profileQuery = useQuery({
    queryKey: ["profile", targetUserId],
    queryFn: async () => {
      const paths = [`/users/${targetUserId}/profile`, `/users/${targetUserId}`];
      for (const path of paths) {
        try {
          const response = await api.get(path);
          const data = response.data?.data ?? response.data;
          const profile = data?.user ?? data?.profile ?? data;
          if (profile && typeof profile === "object") return profile;
        } catch {
          continue;
        }
      }
      return null;
    },
    enabled: !!targetUserId,
  });

  const userPostsQuery = useQuery({
    queryKey: ["userPosts", targetUserId],
    queryFn: async () => {
      try {
        const response = await api.get(
          `/users/${targetUserId}/posts?page=1&limit=20`,
        );
        const data = response.data?.data;
        const list = Array.isArray(data) ? data : data?.posts || [];
        return list as Post[];
      } catch {
        return [] as Post[];
      }
    },
    enabled: !!targetUserId,
  });

  const savedQuery = useQuery({
    queryKey: ["saved"],
    queryFn: async () => {
      const paths = [
        "/users/bookmarks",
        "/posts/saved",
        "/posts/bookmarks",
        "/users/saved",
      ];
      for (const path of paths) {
        try {
          const response = await api.get(path);
          const data = response.data?.data ?? response.data;
          const list = Array.isArray(data)
            ? data
            : data?.bookmarks || data?.posts || data?.savedPosts || data?.saved;
          if (Array.isArray(list)) return list;
        } catch {
          continue;
        }
      }
      return null;
    },
    enabled: ownProfile,
  });

  const feedPosts = posts.filter((post) => {
    const owner = post.postCreator || post.user || post.userId;
    return String(owner?._id || owner?.id || "") === targetUserId;
  });

  const seenPosts = new Set<string>();
  const userPosts = [...feedPosts, ...(userPostsQuery.data || [])]
    .filter((post) => {
      const id = getPostId(post);
      if (!id || seenPosts.has(id)) return false;
      seenPosts.add(id);
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    );

  const postOwner = userPosts[0]
    ? userPosts[0].postCreator || userPosts[0].user || userPosts[0].userId
    : null;

  const profileData =
    profileQuery.data ||
    (ownProfile ? user : typeof postOwner === "object" ? postOwner : null);

  const name =
    profileData?.name ||
    profileData?.userName ||
    (ownProfile ? user?.name : "") ||
    "Route Posts member";

  const followersCount =
    profileData?.followersCount ??
    profileData?.followers?.length ??
    (ownProfile ? (user?.followersCount ?? user?.followers?.length ?? 0) : 0);

  const followingCount =
    profileData?.followingCount ??
    profileData?.following?.length ??
    (ownProfile ? (user?.followingCount ?? user?.following?.length ?? 0) : 0);

  const savedCount = savedQuery.data
    ? savedQuery.data.length
    : savedIds.length ||
    profileData?.savedPosts?.length ||
    profileData?.saved?.length ||
    user?.savedPosts?.length ||
    user?.saved?.length ||
    0;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    setUploading(true);
    try {
      const response = await fetch(
        "https://route-posts.routemisr.com/users/upload-photo",
        {
          method: "PUT",
          headers: {
            token: localStorage.getItem("token") || "",
          },
          body: formData,
        },
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Profile photo updated successfully");
        window.location.reload();
      } else {
        toast.error(data.message || "Failed to upload photo");
      }
    } catch (error) {
      toast.error("An error occurred while uploading");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-page">
      <Helmet>
        <title>{name} | Route Posts</title>
      </Helmet>
      <section className="profile-hero card">
        <div className="profile-cover" />
        <div className="profile-main">
          <div className="relative group inline-block">
            <img
              className="profile-avatar"
              src={
                profileData?.photo ||
                profileData?.image ||
                (ownProfile ? user?.photo || user?.image : "") ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0b3b9c&color=fff&size=180`
              }
              alt="Profile"
            />
            {ownProfile && (
              <label
                htmlFor="avatar-input"
                className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-blue-700 transition"
              >
                <Camera size={16} />
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
          <div className="profile-identity">
            <h1>{name}</h1>
            <p>
              @
              {profileData?.userName ||
                profileData?.username ||
                (ownProfile ? user?.userName : "") ||
                "member"}
            </p>
          </div>
          <div className="profile-stats">
            <div>
              <span>POSTS</span>
              <strong>{userPosts.length}</strong>
            </div>
            <div>
              <span>FOLLOWERS</span>
              <strong>{followersCount}</strong>
            </div>
            <div>
              <span>FOLLOWING</span>
              <strong>{followingCount}</strong>
            </div>
          </div>
        </div>
        <div className="profile-info-grid">
          <div className="about-box">
            <h3>About</h3>
            <p>
              <Mail size={17} />
              {profileData?.email || (ownProfile ? user?.email : "") || "No email available"}
            </p>

          </div>
          <div className="profile-counts">
            <div>
              <span>MY POSTS</span>
              <strong>
                <FileText size={18} />
                {userPosts.length}
              </strong>
            </div>
            <div>
              <span>SAVED POSTS</span>
              <strong>
                <Bookmark size={18} />
                {savedCount}
              </strong>
            </div>
          </div>
        </div>
      </section>
      <section className="profile-posts">
        <div className="profile-posts-heading">
          <h2>{ownProfile ? "My Posts" : "Posts"}</h2>
          <span>{userPosts.length}</span>
        </div>
        {postsQuery.isLoading || userPostsQuery.isLoading ? (
          <div className="empty-state">Loading profile...</div>
        ) : userPosts.length ? (
          userPosts.map((post) => (
            <PostCard
              key={getPostId(post)}
              post={post}
              onLike={(id) => likeMutation.mutate(id)}
              onBookmark={(id) => bookmarkMutation.mutate(id)}
              saved={isSaved(getPostId(post))}
              onDelete={setDeleting}
              onEdit={() => toast("You can edit your posts from the feed menu")}
            />
          ))
        ) : (
          <div className="empty-state">{ownProfile ? "You have not posted yet." : "No posts yet."}</div>
        )}
      </section>
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
  );
}
