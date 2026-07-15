import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EmptyState from "@/components/layout/EmptyState.js";
import CreateOrgPrompt from "@/components/orgs/CreateOrgPrompt.js";
import { canManageMembers } from "@/types/tracker.js";
import type { OrgRole, OrgMember } from "@/types/tracker.js";
import * as store from "@/store/tracker-store.js";
import { toast } from "sonner";

const ROLE_COLORS: Record<OrgRole, string> = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  manager: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  member: "bg-muted text-muted-foreground",
};

export default function MembersPage() {
  const { user, currentOrg } = useAuth();

  if (!currentOrg) {
    return <CreateOrgPrompt />;
  }

  return (
    <MembersContent
      userId={user!.id}
      orgId={currentOrg.id}
      orgRole={currentOrg.role as OrgRole}
    />
  );
}

function MembersContent({
  userId,
  orgId,
  orgRole,
}: {
  userId: string;
  orgId: string;
  orgRole: OrgRole;
}) {
  const [version, setVersion] = useState(0);
  const members: OrgMember[] = useMemo(() => store.getOrgMembers(orgId), [orgId, version]);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<OrgRole>("member");

  const handleInvite = useCallback(() => {
    if (!inviteEmail.trim()) return;
    try {
      store.inviteMember(
        orgId,
        userId,
        inviteEmail.trim(),
        inviteName.trim(),
        inviteRole
      );
      toast.success(`Invited ${inviteEmail.trim()}`);
      setInviteOpen(false);
      setInviteEmail("");
      setInviteName("");
      setInviteRole("member");
      setVersion((v) => v + 1);
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : String(err);
      toast.error(message);
    }
  }, [inviteEmail, inviteName, inviteRole, orgId, userId]);

  return (
    <div className="flex flex-col gap-4 overflow-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Members</h1>
        {canManageMembers(orgRole) && (
          <Button onClick={() => setInviteOpen(true)}>
            <Icon icon="user-plus" className="h-4 w-4 mr-1" />
            Invite Member
          </Button>
        )}
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon="users"
          title="No members"
          description="Invite teammates to collaborate on projects."
          actionLabel={canManageMembers(orgRole) ? "Invite Member" : undefined}
          onAction={canManageMembers(orgRole) ? () => setInviteOpen(true) : undefined}
        />
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.display_name}</TableCell>
                  <TableCell className="text-muted-foreground">{member.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize ${ROLE_COLORS[member.role]}`}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(member.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Add a teammate to your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-name">Name</Label>
              <Input
                id="invite-name"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="teammate@example.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as OrgRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  {orgRole === "admin" && <SelectItem value="admin">Admin</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={!inviteEmail.trim()}>
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
