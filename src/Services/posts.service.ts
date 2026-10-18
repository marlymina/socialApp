import api from "./api";
import type { Post } from "../Interfaces/Post";

export async function getPosts(page = 1) {
  const response = await api.get(`/posts/feed?page=${page}&limit=10&only=all`);
  const data = response.data?.data;
  if (Array.isArray(data)) return data as Post[];
  if (Array.isArray(data?.posts)) return data.posts as Post[];
  if (Array.isArray(data?.feed)) return data.feed as Post[];
  if (Array.isArray(response.data?.posts)) return response.data.posts as Post[];
  return [];
}

export async function createPost(data: { body: string; image?: File | null }) {
  const formData = new FormData();
  formData.append("body", data.body);
  if (data.image) formData.append("image", data.image);
  const response = await api.post("/posts", formData, { headers: { "Content-Type": "multipart/form-data" } });
  return response.data;
}

export async function updatePost(postId: string, data: { body: string; image?: File | null; removeImage?: boolean }) {
  const formData = new FormData();
  formData.append("body", data.body);
  if (data.image) formData.append("image", data.image);
  if (data.removeImage) formData.append("removeImage", "true");
  const response = await api.put(`/posts/${postId}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
  return response.data;
}

export async function deletePost(postId: string) {
  const response = await api.delete(`/posts/${postId}`);
  return response.data;
}

export async function toggleLike(postId: string) {
  const response = await api.put(`/posts/${postId}/like`);
  return response.data;
}

export async function toggleBookmark(postId: string) {
  const response = await api.put(`/posts/${postId}/bookmark`);
  return response.data;
}

export async function sharePost(postId: string, body: string) {
  const response = await api.post(`/posts/${postId}/share`, { body });
  return response.data;
}

export async function getPost(postId: string) {
  const response = await api.get(`/posts/${postId}`);
  return response.data?.data?.post ?? response.data?.data ?? response.data?.post ?? response.data;
}
