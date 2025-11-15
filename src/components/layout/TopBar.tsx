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
    <header className="sticky bg-primary border-color-secondary shadow-lg border-b-2 top-0 left-0 right-0 p-4 flex justify-end z-50">
      <Button variant="outline" onClick={handleLogout}>
        Logout
      </Button>
    </header>
  );
}
