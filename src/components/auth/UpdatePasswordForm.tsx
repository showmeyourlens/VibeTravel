import React, { useState } from "react";
import { updatePassword } from "../../lib/api-client";
import { Button } from "../ui/button";
import { navigate } from "astro:transitions/client";

interface FormErrors {
  newPassword?: string;
  confirmPassword?: string;
  submit?: string;
}

const validatePasswordStrength = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
};

export const UpdatePasswordForm: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (!validatePasswordStrength(newPassword)) {
      newErrors.newPassword = "Password must be at least 8 characters with uppercase, lowercase, and a number";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await updatePassword(newPassword);
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ submit: error.message });
      } else {
        setErrors({ submit: "An error occurred while updating your password. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = newPassword ? validatePasswordStrength(newPassword) : false;

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="space-y-2 text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Create new password</h2>
        <p className="text-sm text-muted-foreground">Enter a new password for your account.</p>
      </div>

      {isSuccess && (
        <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20">
          <p className="text-sm text-green-500">Your password has been updated successfully. Redirecting to login...</p>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="newPassword" className="block text-sm font-medium text-foreground">
          New Password
        </label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={`w-full px-4 py-2.5 rounded-md border bg-background text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            errors.newPassword ? "border-destructive focus:ring-destructive/50" : "border-input"
          }`}
          placeholder="••••••••"
          disabled={isLoading || isSuccess}
          aria-invalid={!!errors.newPassword}
          aria-describedby={errors.newPassword ? "new-password-error" : undefined}
        />
        {newPassword && (
          <div className="flex items-center gap-2 text-xs mt-1">
            <div
              className={`h-2 w-8 rounded-full transition-colors ${
                passwordStrength ? "bg-green-500" : "bg-destructive/50"
              }`}
            />
            <span className={passwordStrength ? "text-green-600" : "text-muted-foreground"}>
              {passwordStrength ? "Strong password" : "Weak password"}
            </span>
          </div>
        )}
        {errors.newPassword && (
          <p id="new-password-error" className="text-sm text-destructive">
            {errors.newPassword}
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
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={`w-full px-4 py-2.5 rounded-md border bg-background text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            errors.confirmPassword ? "border-destructive focus:ring-destructive/50" : "border-input"
          }`}
          placeholder="••••••••"
          disabled={isLoading || isSuccess}
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
        />
        {errors.confirmPassword && (
          <p id="confirm-password-error" className="text-sm text-destructive">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {errors.submit && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{errors.submit}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading || isSuccess}>
        {isLoading ? "Updating password..." : "Update Password"}
      </Button>

      <div className="text-center">
        <a href="/login" className="text-sm text-primary hover:underline">
          Back to login
        </a>
      </div>
    </form>
  );
};
