import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";
import { Helmet } from "react-helmet-async";

interface Person {
  _id?: string;
  id?: string;
  name?: string;
  userName?: string;
  username?: string;
  photo?: string;
  image?: string;
}

interface NotificationItem {
  _id?: string;
  id?: string;
  message?: string;
  body?: string;
  text?: string;
  type?: string;
  action?: string;
  event?: string;
  entityType?: string;
  targetType?: string;
  entityId?: string;
  postId?: string;
  post?: Person | string | null;
  entity?: Record<string, any> | string | null;
  actor?: Person | string | null;
  sender?: Person | string | null;
  from?: Person | string | null;
  fromUser?: Person | string | null;
  triggeredBy?: Person | string | null;
  user?: Person | string | null;
  createdAt?: string;
  isRead?: boolean;
  read?: boolean;
}

function getActor(item: NotificationItem): Person | null {
  const candidates = [
    item.actor,
    item.sender,
    item.from,
    item.fromUser,
    item.triggeredBy,
    item.user,
  ];
  const found = candidates.find(
    (value) => typeof value === "object" && value !== null,
  );
  return (found as Person) || null;
}

function getKind(item: NotificationItem) {
  return String(item.type || item.action || item.event || "").toLowerCase();
}

function getTarget(item: NotificationItem) {
  const entity = typeof item.entity === "object" && item.entity ? item.entity : null;
  return String(
    item.entityType || item.targetType || entity?.type || entity?.entityType || "",
  ).toLowerCase();
}

function describeAction(item: NotificationItem) {
  const kind = getKind(item);
  const target = getTarget(item);
  const onComment = target.includes("comment") || /comment.*like|like.*comment/.test(kind);

  if (/like|react/.test(kind)) {
    return onComment ? "liked your comment" : "liked your post";
  }
  if (/share|repost/.test(kind)) return "shared your post";
  if (/reply/.test(kind)) return "replied to your comment";
  if (/mention/.test(kind)) {
    return onComment ? "mentioned you in a comment" : "mentioned you in a post";
  }
  if (/comment/.test(kind)) return "commented on your post";
  if (/follow/.test(kind)) return "started following you";
  return "";
}

function buildMessage(item: NotificationItem) {
  const actor = getActor(item);
  const actorName = actor?.name || actor?.userName || actor?.username || "";
  const action = describeAction(item);
  if (action) return `${actorName || "Someone"} ${action}`;
  return item.message || item.body || item.text || "You have a new notification";
}

function getPostId(item: NotificationItem) {
  const entity = typeof item.entity === "object" && item.entity ? item.entity : null;
  const post = typeof item.post === "object" && item.post ? item.post : null;
  const target = getTarget(item);
  const entityPost = entity?.post;
  const candidates = [
    item.postId,
    typeof item.post === "string" ? item.post : "",
    post?._id,
    post?.id,
    typeof entityPost === "string" ? entityPost : entityPost?._id,
    target.includes("comment") ? "" : item.entityId,
    target.includes("comment") ? "" : entity?._id,
  ];
  return String(candidates.find((value) => value) || "");
}

export default function Notifications() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await api.get("/notifications?page=1&limit=20");
      const data = response.data?.data;
      return (Array.isArray(data) ? data : data?.notifications || []) as NotificationItem[];
    },
  });
  const readAll = useMutation({
    mutationFn: async () => api.patch("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notifications marked as read");
    },
    onError: () => toast.error("Could not update notifications"),
  });
  const readOne = useMutation({
    mutationFn: async (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  function openNotification(item: NotificationItem) {
    const id = String(item._id || item.id || "");
    if (id && !(item.isRead || item.read)) readOne.mutate(id);
    const actor = getActor(item);
    const actorId = String(actor?._id || actor?.id || "");
    const postId = getPostId(item);
    if (/follow/.test(getKind(item)) && actorId) navigate(`/profile/${actorId}`);
    else if (postId) navigate(`/posts/${postId}`);
  }

  return (
    <section className="notifications-page card">
      <Helmet>
        <title>Notifications | Route Posts</title>
      </Helmet>
      <div className="section-heading">
        <div>
          <span className="heading-icon">
            <Bell size={22} />
          </span>
          <div>
            <h1>Notifications</h1>
            <p>Updates from your community</p>
          </div>
        </div>
        <button
          className="secondary-button"
          onClick={() => readAll.mutate()}
          disabled={readAll.isPending}
        >
          <CheckCheck size={17} /> Mark all read
        </button>
      </div>
      {query.isLoading ? (
        <div className="empty-state">Loading notifications...</div>
      ) : query.data?.length ? (
        query.data.map((item, index) => {
          const actor = getActor(item);
          const actorPhoto = actor?.photo || actor?.image;
          return (
            <button
              className={`notification-item ${item.isRead || item.read ? "" : "unread"}`}
              key={item._id || item.id || index}
              onClick={() => openNotification(item)}
            >
              <span className="notification-icon">
                {actorPhoto ? (
                  <img
                    src={actorPhoto}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Bell size={18} />
                )}
              </span>
              <span>
                <strong>{buildMessage(item)}</strong>
                <small>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : "Recently"}
                </small>
              </span>
            </button>
          );
        })
      ) : (
        <div className="empty-state">
          <Bell size={28} />
          <h3>You're all caught up</h3>
          <p>New notifications will appear here.</p>
        </div>
      )}
    </section>
  );
}
