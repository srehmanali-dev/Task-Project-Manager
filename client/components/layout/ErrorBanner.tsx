import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

interface ErrorBannerProps {
  error: unknown;
  onRetry?: () => void;
}

export default function ErrorBanner({ error, onRetry }: ErrorBannerProps) {
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as { message: unknown }).message)
      : String(error);

  return (
    <div className="flex items-center gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-4">
      <Icon icon="circle-alert" className="h-5 w-5 text-destructive shrink-0" />
      <p className="text-sm text-destructive flex-1">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
