import { ParcelStatus } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useMyParcels } from "@/hooks/useQueries";
import { PARCEL_STATUS_BADGE_CLASS, PARCEL_STATUS_LABELS } from "@/types";
import { Link } from "@tanstack/react-router";
import { MapPin, Package, PackageOpen, Plus } from "lucide-react";
import { motion } from "motion/react";

function formatDate(ts: bigint): string {
  const ms = Number(ts);
  if (!Number.isFinite(ms) || ms <= 0) return "—";
  return new Date(ms).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function Transporteur() {
  const { transporterProfile, principal, role } = useAuth();
  const { data: parcels, isLoading } = useMyParcels();

  const isPending = role === "transporter-pending";
  const principalText =
    transporterProfile?.principal?.toString() ?? principal ?? "—";

  return (
    <div className="animate-fade-in">
      {/* Welcome header — elevated card background, distinct from content */}
      <section className="border-b border-border bg-card">
        <div className="container py-10 md:py-14">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Espace transporteur
              </p>
              <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
                Bienvenue
              </h1>
              <p className="mt-2 text-muted-foreground">
                Gérez vos colis et suivez leur statut en temps réel.
              </p>
            </div>
            <Button asChild data-ocid="transporteur.new_parcel_button">
              <Link to="/transporteur/colis/nouveau">
                <Plus className="size-4" />
                Nouveau colis
              </Link>
            </Button>
          </div>

          {isPending && (
            <div className="mt-6 rounded-md border border-border bg-muted/40 p-4">
              <p className="text-sm text-foreground">
                <span className="font-medium">
                  Compte en attente de validation.
                </span>{" "}
                <span className="text-muted-foreground">
                  Un administrateur doit valider votre compte avant que vous
                  puissiez enregistrer des colis.
                </span>
              </p>
            </div>
          )}

          {/* Identity cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Statut du compte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">
                  {transporterProfile?.status === "validated"
                    ? "Validé"
                    : transporterProfile?.status === "pending"
                      ? "En attente"
                      : transporterProfile?.status === "rejected"
                        ? "Rejeté"
                        : "—"}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Identifiant (principal)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="truncate font-mono text-xs text-foreground">
                  {principalText}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Parcels list — content background */}
      <section className="bg-background">
        <div className="container py-10 md:py-14">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl font-semibold">Mes colis</h2>
            <span className="text-sm text-muted-foreground">
              {parcels?.length ?? 0} colis
            </span>
          </div>

          {isLoading ? (
            <div
              className="mt-4 space-y-3"
              data-ocid="transporteur.parcels.loading_state"
            >
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ) : !parcels || parcels.length === 0 ? (
            <Card className="mt-4">
              <CardContent
                className="flex flex-col items-center gap-3 p-10 text-center"
                data-ocid="transporteur.parcels.empty_state"
              >
                <span className="flex size-12 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                  <PackageOpen className="size-6" />
                </span>
                <p className="font-medium text-foreground">Aucun colis</p>
                <p className="text-sm text-muted-foreground">
                  Vous n'avez pas encore enregistré de colis. Commencez dès
                  maintenant.
                </p>
                <Button
                  asChild
                  data-ocid="transporteur.parcels.empty.new_parcel_button"
                >
                  <Link to="/transporteur/colis/nouveau">
                    <Plus className="size-4" />
                    Enregistrer un colis
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {parcels.map((parcel, i) => (
                <motion.div
                  key={parcel.id.toString()}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                >
                  <Card className="h-full transition-shadow hover:shadow-elevated">
                    <Link
                      to="/transporteur/colis/$id"
                      params={{ id: parcel.id.toString() }}
                      data-ocid={`transporteur.parcel.item.${i + 1}`}
                      className="block h-full"
                    >
                      <CardContent className="flex h-full flex-col gap-4 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {parcel.clientName || "Client non précisé"}
                            </p>
                            <p className="mt-1 font-mono text-xs text-muted-foreground">
                              Colis #{parcel.id.toString()}
                            </p>
                          </div>
                          <Badge
                            className={PARCEL_STATUS_BADGE_CLASS[parcel.status]}
                          >
                            {PARCEL_STATUS_LABELS[parcel.status]}
                          </Badge>
                        </div>

                        <div className="inline-flex w-fit items-center gap-1.5 rounded-md border border-accent/30 bg-accent/5 px-2.5 py-1">
                          <span className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                            Code
                          </span>
                          <span className="font-mono text-xs font-semibold text-accent">
                            {parcel.trackingCode || "—"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              Expéditeur
                            </p>
                            <p className="truncate font-medium text-foreground">
                              {parcel.senderName || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              Type
                            </p>
                            <p className="truncate font-medium text-foreground">
                              {parcel.parcelType || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              Nombre
                            </p>
                            <p className="font-medium text-foreground">
                              {Number(parcel.parcelCount)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-auto space-y-1 border-t border-border pt-3">
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                            <p className="line-clamp-2 text-foreground">
                              {parcel.destinationAddress || "—"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Package className="size-3.5 shrink-0" />
                            <span>Créé le {formatDate(parcel.createdAt)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
