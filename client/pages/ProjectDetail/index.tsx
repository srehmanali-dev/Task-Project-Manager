import { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext.js";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import KanbanBoard from "@/components/kanban/KanbanBoard.js";
import TaskDialog from "@/components/kanban/TaskDialog.js";
import type { Task, TaskStatus, OrgMember } from "@/types/tracker.js";
import * as store from "@/store/tracker-store.js";
import { toast } from "sonner";

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, currentOrg } = useAuth();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [version, setVersion] = useState(0);

  const tasks = useMemo(
    () => (projectId ? store.getTasks(projectId) : []),
    [projectId, version]
  );
  const members: OrgMember[] = useMemo(
    () => (currentOrg ? store.getOrgMembers(currentOrg.id) : []),
    [currentOrg]
  );

  const handleTaskStatusChange = useCallback(
    (taskId: string, newStatus: TaskStatus) => {
      try {
        store.updateTaskStatus(taskId, newStatus);
        setVersion((v) => v + 1);
      } catch (err) {
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: unknown }).message)
            : String(err);
        toast.error("Failed to update task: " + message);
      }
    },
    []
  );

  const handleTaskClick = useCallback((task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  }, []);

  const handleNewTask = useCallback(() => {
    setEditingTask(null);
    setDialogOpen(true);
  }, []);

  const handleSaved = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  return (
    <div className="flex flex-col gap-4 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/projects")}>
            <Icon icon="arrow-left" className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Project Board</h1>
        </div>
        <Button onClick={handleNewTask}>
          <Icon icon="plus" className="h-4 w-4 mr-1" />
          New Task
        </Button>
      </div>

      <KanbanBoard
        tasks={tasks}
        onTaskStatusChange={handleTaskStatusChange}
        onTaskClick={handleTaskClick}
      />

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        projectId={projectId ?? ""}
        userId={user?.id ?? ""}
        members={members}
        onSaved={handleSaved}
      />
    </div>
  );
}
