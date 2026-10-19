import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { registerUser } from "../Services/auth.service";
import { getErrorMessage } from "../Services/api";
import { Helmet } from "react-helmet-async";
import { TbWorld } from "react-icons/tb";

const schema = z
  .object({
    name: z.string().min(4, "Name must be at least 4 characters"),
    username: z
      .string()
      .min(2, "Username must be at least 2 characters")
      .max(20, "Username is too long")
      .regex(/^[a-zA-Z0-9_]+$/, "Use letters, numbers and underscore only"),
    email: z.email("Enter a valid email"),
    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required")
      .refine(
        (value) => new Date(value) < new Date(),
        "Date must be in the past",
      ),
    gender: z.enum(["male", "female"], { message: "Choose your gender" }),
    password: z.string().min(6, "Password must be at least 6 characters"),
    rePassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.rePassword, {
    path: ["rePassword"],
    message: "Passwords do not match",
  });
type FormData = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues: {
      name: "",
      username: "",
      email: "",
      dateOfBirth: "",
      gender: "male",
      password: "",
      rePassword: "",
    },
  });
  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (response) => {
      toast.success(
        response?.message || "Account created successfully. Please log in.",
      );
      navigate("/login");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  return (
    <div className="auth-page register-page">
      <Helmet>
        <title>Sign up | Route Posts</title>
      </Helmet>
      <form
        className="auth-card card"
        onSubmit={handleSubmit((data) => {
          const payload = {
            ...data,
            userName: data.username,
          };
          mutation.mutate(payload);
        })}
      >
        <div className="auth-logo">
          <TbWorld className="text-2xl" />
        </div>
        <h1>Create your account</h1>
        <p className="auth-subtitle">
          Join your friends and share your moments.
        </p>
        <div className="form-grid">
          <label>
            Name
            <input {...register("name")} placeholder="Full name" />
            {errors.name && (
              <small className="field-error">{errors.name.message}</small>
            )}
          </label>
          <label>
            Username
            <input {...register("username")} placeholder="Choose a username" />
            {errors.username && (
              <small className="field-error">{errors.username.message}</small>
            )}
          </label>
          <label>
            Email
            <input
              type="email"
              {...register("email")}
              placeholder="name@example.com"
            />
            {errors.email && (
              <small className="field-error">{errors.email.message}</small>
            )}
          </label>
          <label>
            Date of birth
            <input
              type="date"
              max={new Date().toISOString().split("T")[0]}
              {...register("dateOfBirth")}
            />
            {errors.dateOfBirth && (
              <small className="field-error">
                {errors.dateOfBirth.message}
              </small>
            )}
          </label>
          <label>
            Password
            <input
              type="password"
              {...register("password")}
              placeholder="At least 6 characters"
            />
            {errors.password && (
              <small className="field-error">{errors.password.message}</small>
            )}
          </label>
          <label>
            Confirm password
            <input
              type="password"
              {...register("rePassword")}
              placeholder="Repeat password"
            />
            {errors.rePassword && (
              <small className="field-error">{errors.rePassword.message}</small>
            )}
          </label>
        </div>
        <div className="gender-field">
          <span>Gender</span>
          <label>
            <input type="radio" value="male" {...register("gender")} /> Male
          </label>
          <label>
            <input type="radio" value="female" {...register("gender")} /> Female
          </label>
          {errors.gender && touchedFields.gender && (
            <small className="field-error">{errors.gender.message}</small>
          )}
        </div>
        <button
          className="primary-button auth-submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Creating account..." : "Sign Up"}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
