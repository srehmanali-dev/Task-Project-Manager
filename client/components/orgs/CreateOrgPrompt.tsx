import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { toast } from "sonner";
import * as store from "@/store/tracker-store.js";

export default function CreateOrgPrompt() {
  const { user, refreshOrgs } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = useCallback(() => {
    if (!name.trim() || !user) return;
    setLoading(true);
    try {
      store.createOrganization(user.id, user.display_name, user.email, name.trim());
      refreshOrgs();
      toast.success("Organization created!");
      setName("");
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : String(err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [name, user, refreshOrgs]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-muted p-4">
              <Icon icon="building" className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <CardTitle>Create your first organization</CardTitle>
          <CardDescription>
            Organizations help you manage projects and collaborate with your team.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="org-name">Organization name</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Team"
              maxLength={255}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <Button onClick={handleCreate} disabled={loading || !name.trim()} className="w-full">
            {loading ? "Creating…" : "Create Organization"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
