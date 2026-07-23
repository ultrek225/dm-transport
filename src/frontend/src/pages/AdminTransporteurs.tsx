import { type TransporterProfile, TransporterStatus } from "@/backend";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useListTransporters,
  useRejectTransporter,
  useRevokeTransporter,
  useValidateTransporter,
} from "@/hooks/useQueries";
import { TRANSPORTER_STATUS_LABELS } from "@/types";
import type { Principal } from "@icp-sdk/core/principal";
import { Ban, Check, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type StatusFilter = "all" | TransporterStatus;

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tous les statuts" },
  { value: TransporterStatus.pending, label: "En attente" },
  { value: TransporterStatus.validated, label: "Validé" },
  { value: TransporterStatus.rejected, label: "Rejeté" },
];

function formatDate(nanos: bigint | null | undefined): string {
  if (nanos === null || nanos === undefined) return "—";
  const ms = Number(nanos) / 1_000_000;
  if (!Number.isFinite(ms) || ms <= 0) return "—";
  return new Date(ms).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function truncatePrincipal(p: Principal): string {
  const s = p.toString();
  return `${s.slice(0, 10)}…${s.slice(-6)}`;
}

// Status badge: amber (pending), green (validated), red (rejected).
function StatusBadge({ status }: { status: TransporterStatus }) {
  if (status === TransporterStatus.pending) {
    return (
      <Badge variant="secondary" className="status-pending border-transparent">
        {TRANSPORTER_STATUS_LABELS[status]}
      </Badge>
    );
  }
  if (status === TransporterStatus.validated) {
    return (
      <Badge
        variant="secondary"
        className="status-delivered border-transparent"
      >
        {TRANSPORTER_STATUS_LABELS[status]}
      </Badge>
    );
  }
  return (
    <Badge variant="destructive">{TRANSPORTER_STATUS_LABELS[status]}</Badge>
  );
}

export function AdminTransporteurs() {
  const { data: transporters, isLoading } = useListTransporters();
  const validateMutation = useValidateTransporter();
  const rejectMutation = useRejectTransporter();
  const revokeMutation = useRevokeTransporter();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  // Principal pending confirmation in the revoke AlertDialog.
  const [revokeTarget, setRevokeTarget] = useState<TransporterProfile | null>(
    null,
  );

  const filtered = useMemo(() => {
    if (!transporters) return [];
    if (statusFilter === "all") return transporters;
    return transporters.filter((t) => t.status === statusFilter);
  }, [transporters, statusFilter]);

  const counts = useMemo(() => {
    const base = { pending: 0, validated: 0, rejected: 0 };
    for (const t of transporters ?? []) {
      if (t.status === TransporterStatus.pending) base.pending += 1;
      else if (t.status === TransporterStatus.validated) base.validated += 1;
      else if (t.status === TransporterStatus.rejected) base.rejected += 1;
    }
    return base;
  }, [transporters]);

  const runMutation = (
    mutation: ReturnType<typeof useValidateTransporter>,
    principal: Principal,
    successLabel: string,
  ) => {
    mutation.mutate(principal, {
      onSuccess: () => toast.success(successLabel),
      onError: (err) => toast.error(err.message || "Échec de l'action."),
    });
  };

  const handleValidate = (t: TransporterProfile) =>
    runMutation(validateMutation, t.principal, "Transporteur validé.");

  const handleReject = (t: TransporterProfile) =>
    runMutation(rejectMutation, t.principal, "Transporteur rejeté.");

  const confirmRevoke = () => {
    if (!revokeTarget) return;
    const target = revokeTarget;
    runMutation(revokeMutation, target.principal, "Transporteur révoqué.");
    setRevokeTarget(null);
  };

  const anyPending =
    validateMutation.isPending ||
    rejectMutation.isPending ||
    revokeMutation.isPending;

  return (
    <div className="animate-fade-in">
      {/* Header — elevated card background, distinct from content. */}
      <section className="border-b border-border bg-card">
        <div className="container py-10">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Transporteurs
          </h1>
          <p className="mt-2 text-muted-foreground">
            Validez, rejetez ou révoquez les comptes transporteurs inscrits.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Card className="flex-1 min-w-[8rem]">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  En attente
                </p>
                <p className="mt-1 font-display text-2xl font-semibold text-foreground">
                  {counts.pending}
                </p>
              </CardContent>
            </Card>
            <Card className="flex-1 min-w-[8rem]">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Validés
                </p>
                <p className="mt-1 font-display text-2xl font-semibold text-foreground">
                  {counts.validated}
                </p>
              </CardContent>
            </Card>
            <Card className="flex-1 min-w-[8rem]">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Rejetés
                </p>
                <p className="mt-1 font-display text-2xl font-semibold text-foreground">
                  {counts.rejected}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Content — background zone. */}
      <section className="bg-background">
        <div className="container py-10">
          {/* Filter bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label
                htmlFor="status-filter"
                className="text-sm font-medium text-foreground"
              >
                Filtrer :
              </label>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as StatusFilter)}
              >
                <SelectTrigger
                  id="status-filter"
                  className="w-[12rem]"
                  data-ocid="admin_transporteurs.status_filter.select"
                >
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              {filtered.length} transporteur{filtered.length > 1 ? "s" : ""}
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent
                className="flex flex-col items-center gap-3 p-10 text-center"
                data-ocid="admin_transporteurs.empty_state"
              >
                <span className="flex size-12 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                  <Users className="size-6" />
                </span>
                <p className="font-medium text-foreground">
                  {statusFilter === "all"
                    ? "Aucun transporteur"
                    : "Aucun transporteur pour ce filtre"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {statusFilter === "all"
                    ? "Aucun transporteur n'est inscrit pour le moment."
                    : "Modifiez le filtre pour voir d'autres statuts."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Principal</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date d'inscription</TableHead>
                    <TableHead>Date de validation</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t, i) => {
                    const idx = i + 1;
                    return (
                      <TableRow
                        key={t.principal.toString()}
                        data-ocid={`admin_transporteurs.row.${idx}`}
                      >
                        <TableCell>
                          <span
                            className="font-mono text-xs text-foreground"
                            title={t.principal.toString()}
                          >
                            {truncatePrincipal(t.principal)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={t.status} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(t.registeredAt)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(t.validatedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {t.status === TransporterStatus.pending && (
                              <>
                                <Button
                                  size="sm"
                                  disabled={anyPending}
                                  onClick={() => handleValidate(t)}
                                  data-ocid={`admin_transporteurs.validate_button.${idx}`}
                                >
                                  <Check className="size-4" />
                                  Valider
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  disabled={anyPending}
                                  onClick={() => handleReject(t)}
                                  data-ocid={`admin_transporteurs.reject_button.${idx}`}
                                >
                                  <X className="size-4" />
                                  Refuser
                                </Button>
                              </>
                            )}
                            {t.status === TransporterStatus.validated && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={anyPending}
                                onClick={() => setRevokeTarget(t)}
                                data-ocid={`admin_transporteurs.revoke_button.${idx}`}
                              >
                                <Ban className="size-4" />
                                Révoquer
                              </Button>
                            )}
                            {t.status === TransporterStatus.rejected && (
                              <span className="text-xs text-muted-foreground">
                                Aucune action
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </section>

      {/* Confirmation dialog for revoke action. */}
      <AlertDialog
        open={revokeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRevokeTarget(null);
        }}
      >
        <AlertDialogContent data-ocid="admin_transporteurs.revoke_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Révoquer ce transporteur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le compte repassera en statut « En attente » et devra être validé
              à nouveau. Le transporteur ne pourra plus accéder à l'espace de
              gestion des colis tant qu'il ne sera pas validé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={revokeMutation.isPending}
              data-ocid="admin_transporteurs.revoke_dialog.cancel_button"
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRevoke}
              disabled={revokeMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="admin_transporteurs.revoke_dialog.confirm_button"
            >
              {revokeMutation.isPending ? "Révocation…" : "Révoquer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
