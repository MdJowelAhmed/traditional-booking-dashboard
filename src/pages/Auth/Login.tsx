import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "@/redux/slices/authSlice";
import type { AuthUserRole } from "@/redux/slices/authSlice";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import { getDefaultRouteForRole } from "@/types/roles";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

type DemoAccount = {
  id: string;
  email: string;
  password: string;
  displayRole: string;
  role: AuthUserRole;
  firstName: string;
  businessId?: string;
  businessName?: string;
};

const demoAccounts: DemoAccount[] = [
  {
    id: "1",
    email: "host@example.com",
    password: "password",
    displayRole: "Host",
    role: "host",
    firstName: "Host",
  },
  {
    id: "2",
    email: "business@example.com",
    password: "password",
    displayRole: "Business",
    role: "business",
    firstName: "Business",
    businessId: "business-demo-001",
    businessName: "Demo Property Co.",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
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
      await new Promise((resolve) => setTimeout(resolve, 800));

      const found = demoAccounts.find(
        (u) => u.email === data.email && u.password === data.password
      );

      if (!found) {
        dispatch(loginFailure("Invalid email or password"));
        return;
      }

      dispatch(
        loginSuccess({
          user: {
            id: found.id,
            email: found.email,
            firstName: found.firstName,
            lastName: "User",
            role: found.role,
            businessId: found.businessId,
            businessName: found.businessName,
          },
          token: "mock-jwt-token-" + Date.now(),
        })
      );

      navigate(getDefaultRouteForRole(found.role), { replace: true });
    } catch {
      dispatch(loginFailure("An error occurred. Please try again."));
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

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
          Demo Credentials
        </span>
      </div>

      <div className="p-4 rounded-lg bg-muted/50 border text-sm space-y-3">
        {demoAccounts.map((acc, index) => (
          <div key={acc.id}>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">{acc.displayRole}</p>
              <p>
                <strong>Email:</strong> {acc.email}
              </p>
              <p>
                <strong>Pass:</strong> {acc.password}
              </p>
            </div>
            {index < demoAccounts.length - 1 && <Separator className="my-3" />}
          </div>
        ))}
      </div>
    </div>
  )
}
