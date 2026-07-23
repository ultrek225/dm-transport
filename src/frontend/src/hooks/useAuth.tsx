import { useMyTransporterProfile } from "@/hooks/useQueries";
import { useIsCallerAdmin } from "@/hooks/useQueries";
import { useRegisterAsTransporter } from "@/hooks/useQueries";
import type { AppRole, TransporterProfile } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface AuthContextValue {
  isAuthenticated: boolean;
  principal: string | null;
  role: AppRole;
  transporterProfile: TransporterProfile | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, identity, login, clear, isInitializing } =
    useInternetIdentity();

  const principal = identity?.getPrincipal()?.toText() ?? null;

  // Only fetch role/profile once authenticated.
  const adminQuery = useIsCallerAdmin();
  const profileQuery = useMyTransporterProfile();
  const registerMutation = useRegisterAsTransporter();

  const [autoRegisterTried, setAutoRegisterTried] = useState(false);

  // Auto-register as transporter on first login if no profile exists yet.
  useEffect(() => {
    if (!isAuthenticated) {
      setAutoRegisterTried(false);
      return;
    }
    if (autoRegisterTried) return;
    // Wait until the profile query has settled (not loading).
    if (profileQuery.isLoading) return;
    if (adminQuery.isLoading) return;

    const isAdmin = adminQuery.data === true;
    const profile = profileQuery.data;

    if (!isAdmin && profile === null && !registerMutation.isPending) {
      setAutoRegisterTried(true);
      registerMutation.mutate(undefined, {
        onError: () => setAutoRegisterTried(false),
      });
    } else {
      setAutoRegisterTried(true);
    }
  }, [
    isAuthenticated,
    autoRegisterTried,
    profileQuery.isLoading,
    profileQuery.data,
    adminQuery.isLoading,
    adminQuery.data,
    registerMutation,
  ]);

  const role: AppRole = useMemo(() => {
    if (!isAuthenticated) return "guest";
    if (adminQuery.data === true) return "admin";
    const profile = profileQuery.data;
    if (!profile) return "guest";
    if (profile.status === "validated") return "transporter";
    if (profile.status === "pending") return "transporter-pending";
    // rejected — treat as pending so they can see status, but not act.
    return "transporter-pending";
  }, [isAuthenticated, adminQuery.data, profileQuery.data]);

  const logout = useCallback(() => {
    clear();
  }, [clear]);

  const value: AuthContextValue = {
    isAuthenticated,
    principal,
    role,
    transporterProfile: profileQuery.data ?? null,
    isLoading: isInitializing || (isAuthenticated && profileQuery.isLoading),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
