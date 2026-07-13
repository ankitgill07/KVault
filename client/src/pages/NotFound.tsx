import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-muted/30 px-4">
      <div className="mx-auto max-w-md text-center">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="text-[120px] font-bold text-primary/20 sm:text-[160px]">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-24 w-24 text-muted-foreground sm:h-32 sm:w-32"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.55 0 2.5-1.355 2.1-2.894L17.1 5.506c-.35-.92-1.41-.92-1.76 0L5.9 17.106c-.35.92.35 2.106 1.356 2.106z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
          Page Not Found
        </h1>
        <p className="mb-8 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Back to Home Button */}
        <Link to="/">
          <Button size="lg" className="min-w-[180px]">
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;