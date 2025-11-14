import { Button } from "../ui/button";
import { logoutUser } from "../../lib/api-client";
import { navigate } from "astro:transitions/client";

export default function TopBar() {
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
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
