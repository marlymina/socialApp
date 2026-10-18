import api from "./api";
import type { Comment } from "../Interfaces/Comment";

export async function getComments(postId: string, page = 1) {
  const response = await api.get(`/posts/${postId}/comments?page=${page}&limit=10`);
  const data = response.data?.data;
  if (Array.isArray(data)) return data as Comment[];
  if (Array.isArray(data?.comments)) return data.comments as Comment[];
  if (Array.isArray(response.data?.comments)) return response.data.comments as Comment[];
  return [];
}

export async function addComment(postId: string, content: string) {
  const response = await api.post(`/posts/${postId}/comments`, { content });
  return response.data;
}

export async function updateComment(postId: string, commentId: string, content: string) {
  const response = await api.put(`/posts/${postId}/comments/${commentId}`, { content });
  return response.data;
}

export async function deleteComment(postId: string, commentId: string) {
  const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
  return response.data;
}
