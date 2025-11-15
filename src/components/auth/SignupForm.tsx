import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { navigate } from "astro:transitions/client";
import { signupUser } from "@/lib/api-client";
import { Button } from "../ui/button";
import { signupSchema } from "@/lib/schemas/auth.schema";

type SignupFormValues = z.infer<typeof signupSchema>;

export const SignupForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      await signupUser(data.email, data.password);
      navigate("/login?registered=true");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred during registration. Please try again.";
      setError("root.submit", {
        type: "manual",
        message: errorMessage,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6" autoComplete="on">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className={`w-full px-4 py-2.5 rounded-md border bg-background text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            errors.email ? "border-destructive focus:ring-destructive/50" : "border-input"
          }`}
          placeholder="your@email.com"
          disabled={isSubmitting}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          autoComplete="email"
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register("password")}
          className={`w-full px-4 py-2.5 rounded-md border bg-background text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            errors.password ? "border-destructive focus:ring-destructive/50" : "border-input"
          }`}
          placeholder="••••••••"
          disabled={isSubmitting}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
          autoComplete="new-password"
        />
        {errors.password && (
          <p id="password-error" className="text-sm text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword")}
          className={`w-full px-4 py-2.5 rounded-md border bg-background text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            errors.confirmPassword ? "border-destructive focus:ring-destructive/50" : "border-input"
          }`}
          placeholder="••••••••"
          disabled={isSubmitting}
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
          autoComplete="new-password"
        />
        {errors.confirmPassword && (
          <p id="confirm-password-error" className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {errors.root?.submit && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{errors.root.submit.message}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Sign Up"}
      </Button>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-primary hover:underline">
            Log in
          </a>
        </p>
      </div>
    </form>
  );
};
