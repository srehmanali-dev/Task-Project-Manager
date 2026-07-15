import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import StatCard from "@/components/dashboard/StatCard.js";
import UpcomingTaskRow from "@/components/dashboard/UpcomingTaskRow.js";
import CreateOrgPrompt from "@/components/orgs/CreateOrgPrompt.js";
import * as store from "@/store/tracker-store.js";

export default function DashboardPage() {
  const { user, currentOrg } = useAuth();

  if (!currentOrg) {
    return <CreateOrgPrompt />;
  }

  return <DashboardContent orgId={currentOrg.id} />;
}

function DashboardContent({ orgId }: { orgId: string }) {
  const dashboard = useMemo(() => store.getDashboard(orgId), [orgId]);

  const todoCount = dashboard.statusCounts.find((s) => s.status === "todo")?.count ?? 0;
  const inProgressCount = dashboard.statusCounts.find((s) => s.status === "in_progress")?.count ?? 0;
  const doneCount = dashboard.statusCounts.find((s) => s.status === "done")?.count ?? 0;
  const totalTasks = todoCount + inProgressCount + doneCount;

  return (
    <div className="flex flex-col gap-6 overflow-auto">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tasks" value={totalTasks} icon="list-checks" />
        <StatCard title="To Do" value={todoCount} icon="circle" />
        <StatCard title="In Progress" value={inProgressCount} icon="clock" />
        <StatCard title="Done" value={doneCount} icon="circle-check" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Due Dates</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard.upcomingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No upcoming due dates in the next 7 days.
              </p>
            ) : (
              <div className="flex flex-col">
                {dashboard.upcomingTasks.map((task, i) => (
                  <div key={task.id}>
                    <UpcomingTaskRow task={task} />
                    {i < dashboard.upcomingTasks.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Org overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Projects</span>
              <span className="font-semibold">{dashboard.totalProjects}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Team Members</span>
              <span className="font-semibold">{dashboard.totalMembers}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completion Rate</span>
              <span className="font-semibold">
                {totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
