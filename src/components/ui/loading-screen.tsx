import { Icon } from "@/components/ui/icon";

export interface LoadingScreenProps {
  message?: string;
  className?: string;
}

export function LoadingScreen({
  message = "Đang tải...",
  className = "",
}: LoadingScreenProps) {
  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm gap-3 p-4 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="relative flex items-center justify-center">
        <Icon
          name="RefreshCw"
          size={32}
          className="text-primary animate-spin"
        />
      </div>
      {message && (
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}

export default LoadingScreen;
