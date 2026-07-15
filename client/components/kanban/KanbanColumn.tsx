import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Icon } from "@/components/ui/icon";
import TaskCard from "./TaskCard.js";
import type { Task, TaskStatus } from "@/types/tracker.js";
import { STATUS_LABELS } from "@/types/tracker.js";
import type { IconName } from "lucide-react/dynamic";

const STATUS_ICONS: Record<TaskStatus, IconName> = {
  todo: "circle",
  in_progress: "clock",
  done: "circle-check",
};

const STATUS_HEADER_COLORS: Record<TaskStatus, string> = {
  todo: "border-t-muted-foreground",
  in_progress: "border-t-blue-500",
  done: "border-t-green-500",
};

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export default function KanbanColumn({ status, tasks, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[300px] w-[300px] rounded-lg bg-muted/50 border-t-4 ${STATUS_HEADER_COLORS[status]} ${
        isOver ? "ring-2 ring-primary/30" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3 pb-2">
        <Icon icon={STATUS_ICONS[status]} className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">{STATUS_LABELS[status]}</h3>
        <span className="text-xs text-muted-foreground ml-auto bg-background rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 p-2 flex-1 min-h-[100px] overflow-y-auto max-h-[calc(100vh-280px)]">
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
              Drop tasks here
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
