import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/context/AuthContext.js";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";

const NAV_ITEMS = [
  { path: "/dashboard", icon: "layout-dashboard" as const, label: "Dashboard" },
  { path: "/projects", icon: "folder-kanban" as const, label: "Projects" },
  { path: "/members", icon: "users" as const, label: "Members" },
];

export default function AppSidebar() {
  const { user, currentOrg, organizations, setCurrentOrg } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleOrgChange = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId);
    if (org) {
      setCurrentOrg(org);
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex flex-col h-full w-[250px] min-w-[250px] bg-sidebar border-r border-border">
      {/* Logo & Org Switcher */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Icon icon="clipboard-list" className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Task Tracker</span>
        </div>

        {organizations.length > 0 && (
          <Select value={currentOrg?.id ?? ""} onValueChange={handleOrgChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-2 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Button
              key={item.path}
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => navigate(item.path)}
            >
              <Icon icon={item.icon} className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <Separator />

      {/* User info */}
      <div className="p-4">
        <div className="text-sm">
          <p className="font-medium truncate">{user?.display_name}</p>
          <p className="text-muted-foreground truncate text-xs">{user?.email}</p>
          {currentOrg && (
            <p className="text-muted-foreground text-xs capitalize mt-0.5">
              Role: {currentOrg.role}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
