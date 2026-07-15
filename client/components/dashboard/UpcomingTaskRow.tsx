import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import type { UpcomingTask } from "@/types/tracker.js";
import { PRIORITY_COLORS, PRIORITY_LABELS } from "@/types/tracker.js";

interface UpcomingTaskRowProps {
  task: UpcomingTask;
}

export default function UpcomingTaskRow({ task }: UpcomingTaskRowProps) {
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const isToday = dueDate
    ? dueDate.toDateString() === new Date().toDateString()
    : false;
  const isTomorrow = dueDate
    ? dueDate.toDateString() === new Date(Date.now() + 86400000).toDateString()
    : false;

  const dueDateLabel = isToday
    ? "Today"
    : isTomorrow
      ? "Tomorrow"
      : dueDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" }) ?? "—";

  return (
    <div className="flex items-center gap-3 py-2.5 px-1">
      <Icon icon="circle" className="h-2 w-2 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{task.title}</p>
        <p className="text-xs text-muted-foreground">{task.project_name}</p>
      </div>
      <Badge variant="outline" className={`text-xs shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
        {PRIORITY_LABELS[task.priority]}
      </Badge>
      <span className={`text-xs shrink-0 ${isToday ? "text-destructive font-medium" : "text-muted-foreground"}`}>
        {dueDateLabel}
      </span>
    </div>
  );
}
