import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { addComment, deleteComment, getComments, updateComment } from "../Services/comments.service";
import { getErrorMessage } from "../Services/api";

export function useComments(postId: string) {
  const queryClient = useQueryClient();
  const commentsQuery = useInfiniteQuery({ queryKey: ["comments", postId], queryFn: ({ pageParam }) => getComments(postId, pageParam), initialPageParam: 1, getNextPageParam: (lastPage, pages) => lastPage.length === 10 ? pages.length + 1 : undefined, enabled: Boolean(postId) });
  const addMutation = useMutation({ mutationFn: (content: string) => addComment(postId, content), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["comments", postId] }); queryClient.invalidateQueries({ queryKey: ["posts"] }); toast.success("Comment added"); }, onError: (error) => toast.error(getErrorMessage(error)) });
  const editMutation = useMutation({ mutationFn: ({ id, content }: { id: string; content: string }) => updateComment(postId, id, content), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["comments", postId] }); toast.success("Comment updated"); }, onError: (error) => toast.error(getErrorMessage(error)) });
  const deleteMutation = useMutation({ mutationFn: (id: string) => deleteComment(postId, id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["comments", postId] }); queryClient.invalidateQueries({ queryKey: ["posts"] }); toast.success("Comment deleted"); }, onError: (error) => toast.error(getErrorMessage(error)) });
  return { comments: commentsQuery.data?.pages.flat() || [], commentsQuery, addMutation, editMutation, deleteMutation };
}
