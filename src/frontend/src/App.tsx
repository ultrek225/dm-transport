import { LayoutOutlet } from "@/components/Layout";
import { type AuthContextValue, AuthProvider, useAuth } from "@/hooks/useAuth";
import { Actualites } from "@/pages/Actualites";
import { AdminActualites } from "@/pages/AdminActualites";
import { AdminColis } from "@/pages/AdminColis";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { AdminTransporteurs } from "@/pages/AdminTransporteurs";
import { ColisDetail } from "@/pages/ColisDetail";
import { Connexion } from "@/pages/Connexion";
import { Home } from "@/pages/Home";
import { NouveauColis } from "@/pages/NouveauColis";
import { Transporteur } from "@/pages/Transporteur";
import {
  Outlet,
  RouterProvider,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";

// ---------------------------------------------------------------------------
// Route guards — read auth from router context (NOT useAuth()).
// beforeLoad runs outside React render context, so we cannot call hooks here.
// Auth is injected via router.update({ context: { auth } }) in <RouterSync/>.
// ---------------------------------------------------------------------------

function requireAdmin({ context }: { context: { auth: AuthContextValue } }) {
  const { role, isLoading } = context.auth;
  if (isLoading) return false;
  if (role !== "admin") throw redirect({ to: "/connexion" });
  return true;
}

function requireTransporter({
  context,
}: {
  context: { auth: AuthContextValue };
}) {
  const { role, isLoading } = context.auth;
  if (isLoading) return false;
  if (role !== "transporter" && role !== "transporter-pending") {
    throw redirect({ to: "/connexion" });
  }
  return true;
}

// Parcel creation/editing routes require a fully validated 'transporter' role.
// 'transporter-pending' users are redirected to their dashboard so they can
// see their pending validation status instead of the parcel form/detail.
function requireValidatedTransporter({
  context,
}: {
  context: { auth: AuthContextValue };
}) {
  const { role, isLoading } = context.auth;
  if (isLoading) return false;
  if (role !== "transporter") {
    if (role === "transporter-pending") {
      throw redirect({ to: "/transporteur" });
    }
    throw redirect({ to: "/connexion" });
  }
  return true;
}

// After-login landing: redirect by role if already authenticated.
function postLoginRedirect({
  context,
}: {
  context: { auth: AuthContextValue };
}) {
  const { role, isAuthenticated, isLoading } = context.auth;
  if (isLoading) return false;
  if (!isAuthenticated) return true; // show the login page
  if (role === "admin") throw redirect({ to: "/admin/colis" });
  if (role === "transporter" || role === "transporter-pending") {
    throw redirect({ to: "/transporteur" });
  }
  return true;
}

// ---------------------------------------------------------------------------
// Router tree — root route is typed with the auth context.
// ---------------------------------------------------------------------------

interface RouterContext {
  auth: AuthContextValue;
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => <LayoutOutlet />,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const newsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/actualites",
  component: Actualites,
});

const connexionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/connexion",
  component: Connexion,
  beforeLoad: postLoginRedirect,
});

const transporterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/transporteur",
  component: Transporteur,
  beforeLoad: requireTransporter,
});

const newParcelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/transporteur/colis/nouveau",
  component: NouveauColis,
  beforeLoad: requireValidatedTransporter,
});

const parcelDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/transporteur/colis/$id",
  component: ColisDetail,
  beforeLoad: requireValidatedTransporter,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/tableau-de-bord",
  component: AdminDashboard,
  beforeLoad: requireAdmin,
});

const adminTransportersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/transporteurs",
  component: AdminTransporteurs,
  beforeLoad: requireAdmin,
});

const adminParcelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/colis",
  component: AdminColis,
  beforeLoad: requireAdmin,
});

const adminNewsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/actualites",
  component: AdminActualites,
  beforeLoad: requireAdmin,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  newsRoute,
  connexionRoute,
  transporterRoute,
  newParcelRoute,
  parcelDetailRoute,
  adminDashboardRoute,
  adminTransportersRoute,
  adminParcelsRoute,
  adminNewsRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: {
    auth: {
      isAuthenticated: false,
      principal: null,
      role: "guest",
      transporterProfile: null,
      isLoading: true,
      login: () => {},
      logout: () => {},
    },
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Syncs the live auth context into the router so beforeLoad guards can read it.
function RouterSync() {
  const auth = useAuth();
  router.update({ context: { auth } });
  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <AuthProvider>
      <RouterSync />
    </AuthProvider>
  );
}
