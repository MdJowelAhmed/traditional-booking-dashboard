import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  buildUserFromAccessToken,
} from "@/redux/slices/authSlice";
import { useLoginMutation } from "@/redux/api/authApi";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import { getDefaultRouteForRole } from "@/types/roles";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

function errorMessageFromLoginError(err: unknown): string {
  if (err && typeof err === "object" && "status" in err) {
    const e = err as { status?: number; data?: unknown };
    const data = e.data as { message?: string; error?: string } | undefined;
    if (data?.message && typeof data.message === "string") return data.message;
    if (data?.error && typeof data.error === "string") return data.error;
    if (typeof e.status === "number") {
      return e.status === 401 || e.status === 400
        ? "Invalid email or password"
        : "Unable to sign in. Please try again.";
    }
  }
  if (err instanceof Error) return err.message;
  return "An error occurred. Please try again.";
}

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [loginMutation] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    dispatch(loginStart());

    try {
      const res = await loginMutation({
        email: data.email.trim(),
        password: data.password,
      }).unwrap();

      if (!res.success) {
        dispatch(
          loginFailure(
            res.message?.trim() ? res.message : "Sign in was not successful."
          )
        );
        return;
      }

      const accessToken = res.data?.accessToken;
      if (!accessToken) {
        dispatch(
          loginFailure(
            res.message?.trim()
              ? res.message
              : "No access token received from server."
          )
        );
        return;
      }

      const user = buildUserFromAccessToken(accessToken);
      if (!user) {
        dispatch(
          loginFailure(
            "This account is not allowed. Only Host and Service roles can use this dashboard."
          )
        );
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        return;
      }

      dispatch(
        loginSuccess({
          user,
          token: accessToken,
          refreshToken: res.data?.refreshToken,
        })
      );

      navigate(getDefaultRouteForRole(user.role), { replace: true });
    } catch (err) {
      dispatch(loginFailure(errorMessageFromLoginError(err)));
    }
  };

  return (
    <div className="space-y-6">
      <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xl">D</span>
        </div>
        <span className="font-display font-bold text-2xl">Dashboard</span>
      </div>

      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className={cn("pl-10", errors.email && "border-destructive")}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className={cn(
                "pl-10 pr-10",
                errors.password && "border-destructive"
              )}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              className="h-4 w-4 rounded border-input"
              {...register("remember")}
            />
            <Label
              htmlFor="remember"
              className="text-sm font-normal cursor-pointer"
            >
              Remember me for 30 days
            </Label>
          </div>
          <Link
            to="/auth/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
        >
          {!isLoading && (
            <>
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
