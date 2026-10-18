import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { changePassword } from "../Services/auth.service";
import { getErrorMessage } from "../Services/api";
import { Helmet } from "react-helmet-async";

const schema = z
  .object({
    password: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    rePassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.rePassword, {
    path: ["rePassword"],
    message: "Passwords do not match",
  });

type FormData = z.infer<typeof schema>;

export default function ChangePassword() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "all",
  });

  const mutation = useMutation({
    mutationFn: (payload: { password: string; newPassword: string }) =>
      changePassword(payload),
    onSuccess: (response) => {
      const token = response?.data?.token || response?.token;
      if (token) localStorage.setItem("token", token);
      toast.success(response?.message || "Password changed successfully");
      reset();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const onSubmit = (data: FormData) => {
    // استبعاد rePassword وإرسال password و newPassword فقط
    const { password, newPassword } = data;
    mutation.mutate({ password, newPassword });
  };

  return (
    <div className="settings-page card">
      <Helmet>
        <title>Change password | Route Posts</title>
      </Helmet>
      <h1>Change password</h1>
      <p>Choose a strong password to keep your account secure.</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>
          Current password
          <input type="password" {...register("password")} />
          {errors.password && (
            <small className="field-error">{errors.password.message}</small>
          )}
        </label>
        <label>
          New password
          <input type="password" {...register("newPassword")} />
          {errors.newPassword && (
            <small className="field-error">{errors.newPassword.message}</small>
          )}
        </label>
        <label>
          Confirm new password
          <input type="password" {...register("rePassword")} />
          {errors.rePassword && (
            <small className="field-error">{errors.rePassword.message}</small>
          )}
        </label>
        <button className="primary-button" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
