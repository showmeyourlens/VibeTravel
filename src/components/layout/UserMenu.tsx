import React from "react";
import { Button } from "../ui/button";

interface UserMenuProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ isAuthenticated = false, onLogout }) => {
  if (!isAuthenticated) {
    return (
      <nav className="flex items-center gap-2" aria-label="Authentication">
        <a href="/login">
          <Button variant="ghost" size="sm">
            Log In
          </Button>
        </a>
        <a href="/signup">
          <Button size="sm">Sign Up</Button>
        </a>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-2" aria-label="User navigation">
      <a href="/dashboard">
        <Button variant="ghost" size="sm">
          My Plans
        </Button>
      </a>
      <Button variant="outline" size="sm" onClick={onLogout} aria-label="Log out of your account">
        Log Out
      </Button>
    </nav>
  );
};
