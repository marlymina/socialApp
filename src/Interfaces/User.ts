export interface User {
  _id?: string;
  id?: string;
  name?: string;
  username?: string;
  userName?: string;
  email?: string;
  photo?: string;
  image?: string;
  dateOfBirth?: string;
  gender?: string;
  followersCount?: number;
  followingCount?: number;
  followers?: unknown[];
  following?: unknown[];
  savedPosts?: unknown[];
  saved?: unknown[];
}
