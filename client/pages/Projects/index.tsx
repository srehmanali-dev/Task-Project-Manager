import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProjectCard from "@/components/projects/ProjectCard.js";
import EmptyState from "@/components/layout/EmptyState.js";
import CreateOrgPrompt from "@/components/orgs/CreateOrgPrompt.js";
import { canDeleteProject } from "@/types/tracker.js";
import type { OrgRole } from "@/types/tracker.js";
import * as store from "@/store/tracker-store.js";
import { toast } from "sonner";

export default function ProjectsPage() {
  const { user, currentOrg } = useAuth();

  if (!currentOrg) {
    return <CreateOrgPrompt />;
  }

  return (
    <ProjectsContent
      userId={user!.id}
      orgId={currentOrg.id}
      orgRole={currentOrg.role as OrgRole}
    />
  );
}

function ProjectsContent({
  userId,
  orgId,
  orgRole,
}: {
  userId: string;
  orgId: string;
  orgRole: OrgRole;
}) {
  const [version, setVersion] = useState(0); // trigger re-renders after mutations
  const projects = useMemo(() => store.getProjects(orgId), [orgId, version]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const handleCreate = useCallback(() => {
    if (!newName.trim()) return;
    try {
      store.createProject(orgId, userId, newName.trim(), newDesc.trim() || null);
      toast.success("Project created!");
      setDialogOpen(false);
      setNewName("");
      setNewDesc("");
      setVersion((v) => v + 1);
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : String(err);
      toast.error(message);
    }
  }, [newName, newDesc, orgId, userId]);

  const handleDelete = useCallback(
    (projectId: string) => {
      try {
        store.deleteProject(projectId, orgId, userId);
        toast.success("Project deleted.");
        setVersion((v) => v + 1);
      } catch (err) {
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: unknown }).message)
            : String(err);
        toast.error(message);
      }
    },
    [orgId, userId]
  );

  return (
    <div className="flex flex-col gap-4 overflow-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Icon icon="plus" className="h-4 w-4 mr-1" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon="folder-kanban"
          title="No projects yet"
          description="Create your first project to start tracking tasks."
          actionLabel="New Project"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              canDelete={canDeleteProject(orgRole)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create project dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
            <DialogDescription>Create a new project to organize your tasks.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="project-name">Name</Label>
              <Input
                id="project-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Project name"
                maxLength={255}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="project-desc">Description (optional)</Label>
              <Textarea
                id="project-desc"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Brief description…"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
