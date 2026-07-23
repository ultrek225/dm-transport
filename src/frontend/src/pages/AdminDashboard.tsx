import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboardStats } from "@/hooks/useQueries";
import {
  type DashboardStats,
  PARCEL_STATUS_BADGE_CLASS,
  PARCEL_STATUS_LABELS,
  ParcelStatus,
} from "@/types";
import { AlertCircle, CheckCircle2, Clock, Package, Truck } from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface StatusRow {
  key: ParcelStatus;
  count: number;
  icon: typeof Clock;
}

function truncatePrincipal(p: string): string {
  return p.length <= 11 ? p : `${p.slice(0, 5)}…${p.slice(-5)}`;
}

function fullPrincipalTitle(p: string): string {
  return p.length <= 11 ? p : `Principal complet : ${p}`;
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["total", "pending", "in-transit", "delivered"].map((id, i) => (
          <Skeleton
            key={id}
            data-ocid={`dashboard.skeleton.card.${i + 1}`}
            className="h-28 rounded-lg"
          />
        ))}
      </div>
      <Skeleton className="h-64 rounded-lg" />
      <Skeleton className="h-72 rounded-lg" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

function DashboardError({ message }: { message: string }) {
  return (
    <Card
      data-ocid="dashboard.error_state"
      className="border-destructive/30 bg-destructive/5"
    >
      <CardContent className="flex items-start gap-3 py-6">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div className="min-w-0">
          <p className="font-display font-semibold text-foreground">
            Impossible de charger les statistiques
          </p>
          <p className="mt-1 text-sm text-muted-foreground break-words">
            {message}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Stat card — single metric with icon + label + value
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: number;
  icon: typeof Package;
  accent?: boolean;
  marker: string;
}

function StatCard({ label, value, icon: Icon, accent, marker }: StatCardProps) {
  return (
    <Card
      data-ocid={marker}
      className={accent ? "border-accent/30 bg-accent/5" : undefined}
    >
      <CardContent className="flex items-center justify-between py-6">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 font-display text-3xl font-semibold tracking-tight tabular-nums text-foreground">
            {value.toLocaleString("fr-FR")}
          </p>
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
            accent
              ? "bg-accent/10 text-accent"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Status breakdown section
// ---------------------------------------------------------------------------

function StatusBreakdown({ stats }: { stats: DashboardStats }) {
  const rows: StatusRow[] = [
    { key: ParcelStatus.pending, count: stats.pendingCount, icon: Clock },
    {
      key: ParcelStatus.inTransit,
      count: stats.inTransitCount,
      icon: Truck,
    },
    {
      key: ParcelStatus.delivered,
      count: stats.deliveredCount,
      icon: CheckCircle2,
    },
  ];

  return (
    <section data-ocid="dashboard.status.section" className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
          Répartition par statut
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          État actuel des colis enregistrés sur la plateforme.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {rows.map((row, index) => {
          const Icon = row.icon;
          return (
            <Card
              key={row.key}
              data-ocid={`dashboard.status.card.${index + 1}`}
            >
              <CardContent className="py-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                        PARCEL_STATUS_BADGE_CLASS[row.key]
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <Badge
                      variant="outline"
                      className={PARCEL_STATUS_BADGE_CLASS[row.key]}
                    >
                      {PARCEL_STATUS_LABELS[row.key]}
                    </Badge>
                  </div>
                  <span className="font-display text-2xl font-semibold tabular-nums text-foreground">
                    {row.count.toLocaleString("fr-FR")}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Transporter breakdown section
// ---------------------------------------------------------------------------

function TransporterBreakdown({ stats }: { stats: DashboardStats }) {
  const transporters = stats.byTransporteur;
  const total = stats.totalParcels;

  return (
    <section data-ocid="dashboard.transporter.section" className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
          Répartition par transporteur
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Top transporteurs par volume de colis, triés par ordre décroissant.
        </p>
      </div>

      {transporters.length === 0 ? (
        <Card data-ocid="dashboard.transporter.empty_state">
          <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Truck
              className="h-8 w-8 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="font-medium text-foreground">
              Aucun colis enregistré
            </p>
            <p className="text-sm text-muted-foreground">
              Les transporteurs apparaîtront ici dès le premier colis créé.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card data-ocid="dashboard.transporter.table">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-right">#</TableHead>
                  <TableHead>Transporteur</TableHead>
                  <TableHead className="text-right">Colis</TableHead>
                  <TableHead className="text-right">Part</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transporters.map(([principal, count], index) => {
                  const share = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <TableRow
                      key={principal}
                      data-ocid={`dashboard.transporter.row.${index + 1}`}
                    >
                      <TableCell className="text-right font-mono text-sm text-muted-foreground tabular-nums">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-foreground">
                        <span title={fullPrincipalTitle(principal)}>
                          {truncatePrincipal(principal)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium text-foreground">
                        {count.toLocaleString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {share.toLocaleString("fr-FR", {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        })}
                        %
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function AdminDashboard() {
  const { data, isLoading, error } = useDashboardStats();

  return (
    <div className="container py-10 lg:py-12">
      <header className="mb-8 space-y-1">
        <h1
          data-ocid="dashboard.page"
          className="font-display text-3xl font-semibold tracking-tight text-foreground"
        >
          Tableau de bord
        </h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de l'activité de la plateforme de transport.
        </p>
      </header>

      {isLoading ? (
        <div data-ocid="dashboard.loading_state">
          <DashboardSkeleton />
        </div>
      ) : error ? (
        <DashboardError
          message={error.message || "Une erreur inattendue est survenue."}
        />
      ) : data ? (
        <div className="space-y-10">
          {/* Total colis — featured card */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total colis"
              value={data.totalParcels}
              icon={Package}
              accent
              marker="dashboard.total.card"
            />
            <StatCard
              label="En attente"
              value={data.pendingCount}
              icon={Clock}
              marker="dashboard.pending.card"
            />
            <StatCard
              label="En cours"
              value={data.inTransitCount}
              icon={Truck}
              marker="dashboard.in_transit.card"
            />
            <StatCard
              label="Livrés"
              value={data.deliveredCount}
              icon={CheckCircle2}
              marker="dashboard.delivered.card"
            />
          </div>

          <StatusBreakdown stats={data} />
          <TransporterBreakdown stats={data} />
        </div>
      ) : null}
    </div>
  );
}

export default AdminDashboard;
