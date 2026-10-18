import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createPost, deletePost, getPosts, sharePost, toggleBookmark, toggleLike, updatePost } from "../Services/posts.service";
import { useSaved } from "./useSaved";
import { getErrorMessage } from "../Services/api";
import type { Post } from "../Interfaces/Post";

function readSavedState(response: any, wasSaved: boolean) {
  const data = response?.data ?? response;
  const flag =
    data?.bookmarked ??
    data?.isBookmarked ??
    data?.saved ??
    data?.isSaved ??
    response?.bookmarked ??
    response?.isBookmarked;
  if (typeof flag === "boolean") return flag;
  const message = String(response?.message || "").toLowerCase();
  if (/remov|unsav|unbookmark|un-bookmark/.test(message)) return false;
  if (/add|sav|bookmark/.test(message)) return true;
  return !wasSaved;
}

export function usePosts() {
  const queryClient = useQueryClient();
  const { isSavedNow, setSaved } = useSaved();
  const postsQuery = useQuery({ queryKey: ["posts"], queryFn: () => getPosts() });
  const createMutation = useMutation({ mutationFn: createPost, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["posts"] }); toast.success("Post published"); }, onError: (error) => toast.error(getErrorMessage(error)) });
  const updateMutation = useMutation({ mutationFn: ({ id, body, image, removeImage }: { id: string; body: string; image?: File | null; removeImage?: boolean }) => updatePost(id, { body, image, removeImage }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["posts"] }); toast.success("Post updated"); }, onError: (error) => toast.error(getErrorMessage(error)) });
  const deleteMutation = useMutation({ mutationFn: deletePost, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["posts"] }); toast.success("Post deleted"); }, onError: (error) => toast.error(getErrorMessage(error)) });
  const likeMutation = useMutation({ mutationFn: toggleLike, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }), onError: (error) => toast.error(getErrorMessage(error)) });
  const shareMutation = useMutation({ mutationFn: ({ id, body }: { id: string; body: string }) => sharePost(id, body), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["posts"] }); queryClient.invalidateQueries({ queryKey: ["post"] }); toast.success("Post shared to your profile!"); }, onError: (error) => toast.error(getErrorMessage(error)) });
  const bookmarkMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await toggleBookmark(postId);
      return { postId, response };
    },
    onSuccess: ({ postId, response }) => {
      const saved = readSavedState(response, isSavedNow(postId));
      setSaved(postId, saved);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["saved"] });
      toast.success(saved ? "Post saved successfully" : "Post removed from saved");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  return { posts: (postsQuery.data || []) as Post[], postsQuery, createMutation, updateMutation, deleteMutation, likeMutation, shareMutation, bookmarkMutation };
}
