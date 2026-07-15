import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { IconName } from "lucide-react/dynamic";

interface EmptyStateProps {
  icon: IconName;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon icon={icon} className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          <Icon icon="plus" className="h-4 w-4 mr-1" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
