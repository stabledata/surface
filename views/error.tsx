import { ArrowLeft } from "lucide-react";
import { Button } from "./components/ui/button";

export const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="space-y-6 max-w-md mx-auto">
        <h1 className="text-9xl font-extrabold tracking-tight text-primary">
          404
        </h1>

        <h2 className="text-3xl font-bold tracking-tight">Page not found</h2>

        <div className="space-y-2">
          <p className="text-muted-foreground">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-muted-foreground">Let's get you back on track.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button asChild>
            <a href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};
