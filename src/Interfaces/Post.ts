import type { User } from "./User";
import type { Comment } from "./Comment";

export interface Post {
  _id?: string;
  id?: string;
  body?: string;
  content?: string;
  image?: string | null;
  createdAt?: string;
  user?: User;
  userId?: User;
  postCreator?: User;
  comments?: Comment[];
  commentsCount?: number;
  likes?: string[];
  topComment?: Comment;
  sharedPost?: Post | string | null;
  originalPost?: Post | string | null;
  sharesCount?: number;
  shareCount?: number;
  shares?: unknown[];
}
