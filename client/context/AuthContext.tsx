import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useSuperblocksUser } from "@superblocksteam/library";
import type { Organization, OrgRole } from "@/types/tracker.js";
import * as store from "@/store/tracker-store.js";

interface AuthUser {
  id: string;
  email: string;
  display_name: string;
}

export interface UserOrg extends Organization {
  role: OrgRole;
}

interface AuthContextType {
  user: AuthUser | null;
  organizations: UserOrg[];
  currentOrg: UserOrg | null;
  setCurrentOrg: (org: UserOrg) => void;
  refreshOrgs: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const sbUser = useSuperblocksUser();

  // Build user from Superblocks platform user
  const user: AuthUser | null = useMemo(() => {
    if (!sbUser?.email) return null;
    return {
      id: sbUser.id ?? sbUser.email,
      email: sbUser.email,
      display_name: sbUser.name ?? sbUser.email.split("@")[0],
    };
  }, [sbUser]);

  const [organizations, setOrganizations] = useState<UserOrg[]>(() => {
    if (!user) return [];
    return loadUserOrgs(user.id);
  });

  const [currentOrg, setCurrentOrg] = useState<UserOrg | null>(
    () => organizations[0] ?? null
  );

  const refreshOrgs = useCallback(() => {
    if (!user) return;
    const orgs = loadUserOrgs(user.id);
    setOrganizations(orgs);
    // Keep current org if still valid, otherwise pick first
    if (currentOrg && orgs.find((o) => o.id === currentOrg.id)) {
      setCurrentOrg(orgs.find((o) => o.id === currentOrg.id)!);
    } else {
      setCurrentOrg(orgs[0] ?? null);
    }
  }, [user, currentOrg]);

  const value = useMemo(
    () => ({
      user,
      organizations,
      currentOrg,
      setCurrentOrg,
      refreshOrgs,
    }),
    [user, organizations, currentOrg, refreshOrgs]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

// Helper to load orgs with roles
function loadUserOrgs(userId: string): UserOrg[] {
  const orgs = store.getOrganizations(userId);
  return orgs.map((org) => ({
    ...org,
    role: store.getUserRole(org.id, userId) ?? "member",
  }));
}
