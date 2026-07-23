import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  Home as HomeIcon,
  LayoutDashboard,
  LogIn,
  LogOut,
  Newspaper,
  Package,
  Truck,
  Users,
} from "lucide-react";
import type { ComponentProps } from "react";

interface NavLinkDef {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  ocid: string;
}

function NavLink({
  to,
  label,
  icon: Icon,
  ocid,
  active,
}: NavLinkDef & { active: boolean }) {
  return (
    <Link
      to={to}
      data-ocid={ocid}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-secondary text-secondary-foreground"
          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

function BrandMark() {
  return (
    <Link
      to="/"
      data-ocid="nav.brand"
      className="flex items-center gap-2.5 shrink-0"
    >
      <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-subtle">
        <Truck className="size-5" />
      </span>
      <span className="font-display text-lg font-semibold tracking-tight">
        DM Transport
      </span>
    </Link>
  );
}

function AuthButton() {
  const { isAuthenticated, role, isLoading, login, logout, principal } =
    useAuth();

  if (isLoading) {
    return <Skeleton className="h-9 w-28 rounded-md" />;
  }

  if (!isAuthenticated) {
    return (
      <Button
        variant="default"
        size="sm"
        onClick={login}
        data-ocid="nav.login_button"
      >
        <LogIn className="size-4" />
        Connexion
      </Button>
    );
  }

  const roleLabel =
    role === "admin"
      ? "Administrateur"
      : role === "transporter"
        ? "Transporteur"
        : role === "transporter-pending"
          ? "En attente"
          : "Connecté";

  return (
    <div className="flex items-center gap-3">
      <div className="hidden md:flex flex-col items-end leading-tight">
        <span className="text-xs font-medium text-foreground">{roleLabel}</span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {principal ? `${principal.slice(0, 6)}…${principal.slice(-4)}` : ""}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={logout}
        data-ocid="nav.logout_button"
      >
        <LogOut className="size-4" />
        <span className="hidden sm:inline">Déconnexion</span>
      </Button>
    </div>
  );
}

function NavLinks() {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  const links: NavLinkDef[] = [
    { to: "/", label: "Accueil", icon: HomeIcon, ocid: "nav.home_link" },
    {
      to: "/actualites",
      label: "Actualités",
      icon: Newspaper,
      ocid: "nav.news_link",
    },
  ];

  if (
    isAuthenticated &&
    (role === "transporter" || role === "transporter-pending")
  ) {
    links.push({
      to: "/transporteur",
      label: "Mon espace",
      icon: LayoutDashboard,
      ocid: "nav.transporter_link",
    });
    links.push({
      to: "/transporteur/colis/nouveau",
      label: "Nouveau colis",
      icon: Package,
      ocid: "nav.new_parcel_link",
    });
  }

  if (isAuthenticated && role === "admin") {
    links.push({
      to: "/admin/tableau-de-bord",
      label: "Tableau de bord",
      icon: LayoutDashboard,
      ocid: "nav.admin_dashboard_link",
    });
    links.push({
      to: "/admin/colis",
      label: "Colis",
      icon: Package,
      ocid: "nav.admin_parcels_link",
    });
    links.push({
      to: "/admin/transporteurs",
      label: "Transporteurs",
      icon: Users,
      ocid: "nav.admin_transporters_link",
    });
    links.push({
      to: "/admin/actualites",
      label: "Actualités",
      icon: Newspaper,
      ocid: "nav.admin_news_link",
    });
  }

  return (
    <nav className="flex items-center gap-1">
      {links.map((link) => (
        <NavLink
          key={link.to}
          {...link}
          active={location.pathname === link.to}
        />
      ))}
    </nav>
  );
}

export function Layout({ children }: ComponentProps<"div">) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card shadow-subtle">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <BrandMark />
            <NavLinks />
          </div>
          <AuthButton />
        </div>
      </header>
      <main className="flex-1 bg-background">{children}</main>
      <footer className="border-t border-border bg-muted/40">
        <div className="container flex h-14 items-center justify-between text-xs text-muted-foreground">
          <span>
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.hostname : "",
              )}`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              caffeine.ai
            </a>
          </span>
          <span className="font-mono">DM Transport</span>
        </div>
      </footer>
    </div>
  );
}

// Router-friendly layout that renders the matched route inside <main>.
export function LayoutOutlet() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
