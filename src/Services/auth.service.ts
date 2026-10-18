import api from "./api";

export interface RegisterData {
  name: string;
  userName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  password: string;
  rePassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export async function registerUser(data: RegisterData) {
  const response = await api.post("/users/signup", data);
  return response.data;
}

export async function loginUser(data: LoginData) {
  const response = await api.post("/users/signin", data);
  return response.data;
}

export async function getProfile() {
  const response = await api.get("/users/profile-data");
  return response.data;
}

export async function changePassword(data: { password: string; newPassword: string; rePassword: string }) {
  const response = await api.patch("/users/change-password", data);
  return response.data;
}

export async function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
