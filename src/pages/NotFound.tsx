
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-teal-900 to-teal-950 text-white p-6">
      <Logo className="mb-8" />
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-teal-300 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="bg-teal-500 hover:bg-teal-400">
          <a href="/">Return to Home</a>
        </Button>
      </div>
      <div className="mt-auto p-6">
        <p className="text-center text-teal-500">© 2020 Network Untop Network. All Rights Reserved</p>
      </div>
    </div>
  );
};

export default NotFound;
