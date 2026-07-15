import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import type { Task } from "@/types/tracker.js";
import { PRIORITY_COLORS, PRIORITY_LABELS } from "@/types/tracker.js";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const isOverdue = dueDate && dueDate < new Date() && task.status !== "done";

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium leading-tight">{task.title}</p>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={`text-[10px] ${PRIORITY_COLORS[task.priority]}`}>
            {PRIORITY_LABELS[task.priority]}
          </Badge>

          {dueDate && (
            <span className={`text-[10px] flex items-center gap-0.5 ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
              <Icon icon="calendar" className="h-3 w-3" />
              {dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}

          {task.assignee_name && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 ml-auto">
              <Icon icon="user" className="h-3 w-3" />
              {task.assignee_name}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
