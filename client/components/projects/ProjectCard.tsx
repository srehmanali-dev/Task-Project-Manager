import { useMemo } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { Project } from "@/types/tracker.js";
import * as store from "@/store/tracker-store.js";

interface ProjectCardProps {
  project: Project;
  canDelete: boolean;
  onDelete: (id: string) => void;
}

export default function ProjectCard({ project, canDelete, onDelete }: ProjectCardProps) {
  const navigate = useNavigate();
  const taskCount = useMemo(() => store.getTasks(project.id).length, [project.id]);

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base truncate">{project.name}</CardTitle>
            {project.description && (
              <CardDescription className="mt-1 line-clamp-2">{project.description}</CardDescription>
            )}
          </div>
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project.id);
              }}
            >
              <Icon icon="trash-2" className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon icon="list-checks" className="h-4 w-4" />
          <span>{taskCount} task{taskCount !== 1 ? "s" : ""}</span>
          <span className="text-xs ml-auto">
            {new Date(project.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
