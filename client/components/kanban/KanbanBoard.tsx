import { useMemo, useCallback } from "react";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { useState } from "react";
import KanbanColumn from "./KanbanColumn.js";
import TaskCard from "./TaskCard.js";
import type { Task, TaskStatus } from "@/types/tracker.js";

const COLUMNS: TaskStatus[] = ["todo", "in_progress", "done"];

interface KanbanBoardProps {
  tasks: Task[];
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
}

export default function KanbanBoard({ tasks, onTaskStatusChange, onTaskClick }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      done: [],
    };
    for (const task of tasks) {
      grouped[task.status].push(task);
    }
    return grouped;
  }, [tasks]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find((t) => t.id === event.active.id);
      if (task) setActiveTask(task);
    },
    [tasks]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over) return;

      const taskId = active.id as string;
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      // Determine the target status
      let targetStatus: TaskStatus | null = null;

      // Check if dropped over a column (droppable area)
      if (COLUMNS.includes(over.id as TaskStatus)) {
        targetStatus = over.id as TaskStatus;
      } else {
        // Dropped over another task — find that task's status
        const overTask = tasks.find((t) => t.id === over.id);
        if (overTask) {
          targetStatus = overTask.status;
        }
      }

      if (targetStatus && targetStatus !== task.status) {
        onTaskStatusChange(taskId, targetStatus);
      }
    },
    [tasks, onTaskStatusChange]
  );

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} onClick={() => {}} />}
      </DragOverlay>
    </DndContext>
  );
}
