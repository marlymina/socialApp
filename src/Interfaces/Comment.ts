import type { User } from "./User";

export interface Comment {
  _id?: string;
  id?: string;
  content?: string;
  comment?: string;
  createdAt?: string;
  commentCreator?: User;
  user?: User;
  likes?: string[];
}
