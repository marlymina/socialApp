import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUser } from "../Services/auth.service";
import { getErrorMessage } from "../Services/api";
import { useAuth } from "../Context/AuthContext";
import { Helmet } from "react-helmet-async";
import { TbWorld } from 'react-icons/tb';


const schema = z.object({
  email: z.string().min(1, "Email or username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues: { email: "", password: "" },
  });
  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      const data = response?.data ?? response;
      const token = data?.token || data?.accessToken;
      const user = data?.user || data?.profile;
      if (!token) {
        toast.error(
          response?.message || "Login response did not include a token",
        );
        return;
      }
      setAuth(token, user);
      toast.success("Welcome back!");
      navigate("/");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  return (
    <div className="auth-page">
      <Helmet>
        <title>Login </title>
      </Helmet>
      <form
        className="auth-card card"
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
      >
        <div className="auth-logo"><TbWorld className="text-2xl"/></div>
        <h1>Welcome back</h1>
        <p className="auth-subtitle">
          Log in and continue your social journey.
        </p>
        <label>
          Email or username
          <input
            {...register("email")}
            placeholder="Enter your email or username"
            autoComplete="username"
          />
        </label>
        {errors.email && (
          <small className="field-error">{errors.email.message}</small>
        )}
        <label>
          Password
          <input
            type="password"
            {...register("password")}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </label>
        {errors.password && (
          <small className="field-error">{errors.password.message}</small>
        )}
        <button
          className="primary-button auth-submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Logging in..." : "Log In"}
        </button>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create account</Link>
        </p>
      </form>
    </div>
  );
}
