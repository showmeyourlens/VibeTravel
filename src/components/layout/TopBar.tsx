import { Button } from "../ui/button";
import { logoutUser } from "../../lib/api-client";

export default function TopBar() {
  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header className="sticky bg-white/90 top-0 left-0 right-0 bg-transparent p-2 flex justify-end z-50">
      <Button variant="outline" onClick={handleLogout}>
        Logout
      </Button>
    </header>
  );
}
