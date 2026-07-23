import {
  type Parcel,
  type ParcelFilter,
  type ParcelId,
  ParcelStatus,
  type ParcelUpdate,
} from "@/backend";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import {
  useAllParcels,
  useDeleteAnyParcel,
  useSearchParcelsQuery,
  useUpdateAnyParcel,
} from "@/hooks/useQueries";
import { PARCEL_STATUS_BADGE_CLASS, PARCEL_STATUS_LABELS } from "@/types";
import {
  Download,
  Loader2,
  Package,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_OPTIONS: ParcelStatus[] = [
  ParcelStatus.pending,
  ParcelStatus.inTransit,
  ParcelStatus.delivered,
];

function formatDate(ns: bigint): string {
  return new Date(Number(ns) / 1_000_000).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function truncatePrincipal(p: { toString(): string }): string {
  const s = p.toString();
  return s.length <= 16 ? s : `${s.slice(0, 8)}…${s.slice(-6)}`;
}

// CSV: escape a single field per RFC 4180 — wrap in quotes if it contains
// a comma, double-quote, newline or carriage return; double any inner quote.
function csvEscape(value: string): string {
  if (value === "") return "";
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildCsv(parcels: Parcel[]): string {
  const header = [
    "Code unique",
    "Expéditeur",
    "Nom client",
    "Téléphone",
    "Adresse destination",
    "Type",
    "Nombre",
    "Statut",
    "Transporteur",
    "Date création",
  ];
  const rows = parcels.map((p) =>
    [
      p.trackingCode,
      p.senderName,
      p.clientName,
      p.clientPhone,
      p.destinationAddress,
      p.parcelType,
      p.parcelCount.toString(),
      PARCEL_STATUS_LABELS[p.status],
      truncatePrincipal(p.owner),
      formatDate(p.createdAt),
    ]
      .map(csvEscape)
      .join(","),
  );
  return [header.join(","), ...rows].join("\r\n");
}

function timestampForFilename(d = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  );
}

function downloadCsv(parcels: Parcel[]): void {
  const csv = buildCsv(parcels);
  // Prepend a UTF-8 BOM so Excel opens accented characters correctly.
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `dm-transport-colis-${timestampForFilename()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Convert a yyyy-mm-dd input value to a nanosecond timestamp (end of day).
function dateToNs(value: string): bigint | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return BigInt(d.getTime() * 1_000_000);
}

// ---------------------------------------------------------------------------
// Edit dialog form state
// ---------------------------------------------------------------------------

interface EditForm {
  clientName: string;
  parcelCount: string;
  parcelType: string;
  destinationAddress: string;
  clientPhone: string;
  additionalInfo: string;
  status: ParcelStatus;
}

function parcelToForm(p: Parcel): EditForm {
  return {
    clientName: p.clientName,
    parcelCount: p.parcelCount.toString(),
    parcelType: p.parcelType,
    destinationAddress: p.destinationAddress,
    clientPhone: p.clientPhone,
    additionalInfo: p.additionalInfo,
    status: p.status,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function AdminColis() {
  const { data: allParcels, isLoading } = useAllParcels();
  const updateMutation = useUpdateAnyParcel();
  const deleteMutation = useDeleteAnyParcel();

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ParcelStatus | "all">("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Edit dialog
  const [editing, setEditing] = useState<Parcel | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);

  // Delete confirmation
  const [deleting, setDeleting] = useState<Parcel | null>(null);

  // Debounce search input to avoid hammering the backend on each keystroke.
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const filter: ParcelFilter | null = useMemo(() => {
    const has =
      debouncedSearch !== "" ||
      statusFilter !== "all" ||
      fromDate !== "" ||
      toDate !== "";
    if (!has) return null;
    return {
      clientNameQuery: debouncedSearch || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      fromDate: dateToNs(fromDate),
      toDate: dateToNs(toDate),
    };
  }, [debouncedSearch, statusFilter, fromDate, toDate]);

  const { data: searchResults, isFetching: searchFetching } =
    useSearchParcelsQuery(filter);

  const parcels = filter ? searchResults : allParcels;
  const showLoading = isLoading || (filter !== null && searchFetching);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setFromDate("");
    setToDate("");
  };

  // --- Edit handlers -------------------------------------------------------

  const openEdit = (p: Parcel) => {
    setEditing(p);
    setEditForm(parcelToForm(p));
  };

  const closeEdit = () => {
    setEditing(null);
    setEditForm(null);
  };

  const handleSaveEdit = () => {
    if (!editing || !editForm) return;
    const count = Number(editForm.parcelCount);
    if (!Number.isInteger(count) || count < 0) {
      toast.error("Le nombre de colis doit être un entier positif.");
      return;
    }
    const update: ParcelUpdate = {
      clientName: editForm.clientName,
      parcelCount: BigInt(count),
      parcelType: editForm.parcelType,
      destinationAddress: editForm.destinationAddress,
      clientPhone: editForm.clientPhone,
      additionalInfo: editForm.additionalInfo,
      status: editForm.status,
    };
    updateMutation.mutate(
      { id: editing.id, update },
      {
        onSuccess: () => {
          toast.success("Colis mis à jour.");
          closeEdit();
        },
        onError: (err) =>
          toast.error(err.message || "Échec de la mise à jour."),
      },
    );
  };

  const handleExportCsv = () => {
    const data = allParcels ?? [];
    if (data.length === 0) {
      toast.info("Aucun colis à exporter.");
      return;
    }
    try {
      downloadCsv(data);
      toast.success(`${data.length} colis exportés.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Échec de l'export CSV.",
      );
    }
  };

  // --- Delete handlers -----------------------------------------------------

  const confirmDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Colis supprimé.");
        setDeleting(null);
      },
      onError: (err) => toast.error(err.message || "Échec de la suppression."),
    });
  };

  // --- Render --------------------------------------------------------------

  return (
    <div className="animate-fade-in">
      <section className="border-b border-border bg-card">
        <div className="container py-10">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Colis
          </h1>
          <p className="mt-2 text-muted-foreground">
            Recherchez, filtrez et gérez l'ensemble des colis enregistrés par
            les transporteurs.
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="container py-10">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="search">Recherche client</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nom du client…"
                    className="pl-9"
                    data-ocid="admin_colis.search.input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="statusFilter">Statut</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(v) =>
                    setStatusFilter(v as ParcelStatus | "all")
                  }
                >
                  <SelectTrigger
                    id="statusFilter"
                    data-ocid="admin_colis.status_filter.select"
                  >
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {PARCEL_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromDate">Du</Label>
                <Input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  data-ocid="admin_colis.from_date.input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="toDate">Au</Label>
                <Input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  data-ocid="admin_colis.to_date.input"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4 lg:flex lg:items-center lg:justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCsv}
                  disabled={isLoading || (allParcels ?? []).length === 0}
                  data-ocid="admin_colis.export_csv_button"
                >
                  <Download className="size-4" />
                  Exporter en CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  disabled={filter === null}
                  data-ocid="admin_colis.reset_button"
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Table / loading / empty */}
          {showLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : !parcels || parcels.length === 0 ? (
            <Card>
              <CardContent
                className="flex flex-col items-center gap-3 p-10 text-center"
                data-ocid="admin_colis.empty_state"
              >
                <span className="flex size-12 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                  <Package className="size-6" />
                </span>
                <p className="font-medium text-foreground">Aucun colis</p>
                <p className="text-sm text-muted-foreground">
                  Aucun colis ne correspond à votre recherche.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code unique</TableHead>
                      <TableHead>Expéditeur</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead className="text-right">Nb.</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Transporteur</TableHead>
                      <TableHead>Créé le</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parcels.map((parcel, i) => (
                      <TableRow
                        key={parcel.id.toString()}
                        className="cursor-pointer"
                        onClick={() => openEdit(parcel)}
                        data-ocid={`admin_colis.row.${i + 1}`}
                      >
                        <TableCell className="font-mono text-xs text-foreground">
                          {parcel.trackingCode || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {parcel.senderName || "—"}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {parcel.clientName || "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {parcel.parcelCount.toString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {parcel.parcelType || "—"}
                        </TableCell>
                        <TableCell className="max-w-[16rem] truncate text-muted-foreground">
                          {parcel.destinationAddress || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={PARCEL_STATUS_BADGE_CLASS[parcel.status]}
                          >
                            {PARCEL_STATUS_LABELS[parcel.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {truncatePrincipal(parcel.owner)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatDate(parcel.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div
                            className="flex justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          >
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEdit(parcel)}
                              aria-label="Modifier le colis"
                              data-ocid={`admin_colis.edit_button.${i + 1}`}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleting(parcel)}
                              disabled={deleteMutation.isPending}
                              aria-label="Supprimer le colis"
                              data-ocid={`admin_colis.delete_button.${i + 1}`}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Edit dialog */}
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) closeEdit();
        }}
      >
        <DialogContent
          className="sm:max-w-2xl"
          data-ocid="admin_colis.edit_dialog"
        >
          <DialogHeader>
            <DialogTitle>Modifier le colis</DialogTitle>
            <DialogDescription>
              {editing && (
                <span className="font-mono">#{editing.id.toString()}</span>
              )}{" "}
              Tous les champs sont modifiables.
            </DialogDescription>
          </DialogHeader>

          {editForm && (
            <div className="grid gap-4 py-2 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit-clientName">Nom du client</Label>
                <Input
                  id="edit-clientName"
                  value={editForm.clientName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, clientName: e.target.value })
                  }
                  data-ocid="admin_colis.edit.client_name.input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-parcelCount">Nombre de colis</Label>
                <Input
                  id="edit-parcelCount"
                  type="number"
                  min={0}
                  value={editForm.parcelCount}
                  onChange={(e) =>
                    setEditForm({ ...editForm, parcelCount: e.target.value })
                  }
                  data-ocid="admin_colis.edit.parcel_count.input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-parcelType">Type de colis</Label>
                <Input
                  id="edit-parcelType"
                  value={editForm.parcelType}
                  onChange={(e) =>
                    setEditForm({ ...editForm, parcelType: e.target.value })
                  }
                  data-ocid="admin_colis.edit.parcel_type.input"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit-destinationAddress">
                  Adresse de destination
                </Label>
                <Input
                  id="edit-destinationAddress"
                  value={editForm.destinationAddress}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      destinationAddress: e.target.value,
                    })
                  }
                  data-ocid="admin_colis.edit.destination.input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-clientPhone">Téléphone</Label>
                <Input
                  id="edit-clientPhone"
                  value={editForm.clientPhone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, clientPhone: e.target.value })
                  }
                  data-ocid="admin_colis.edit.phone.input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Statut</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(v) =>
                    setEditForm({ ...editForm, status: v as ParcelStatus })
                  }
                >
                  <SelectTrigger
                    id="edit-status"
                    data-ocid="admin_colis.edit.status.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {PARCEL_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit-additionalInfo">
                  Informations complémentaires
                </Label>
                <Textarea
                  id="edit-additionalInfo"
                  rows={3}
                  value={editForm.additionalInfo}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      additionalInfo: e.target.value,
                    })
                  }
                  data-ocid="admin_colis.edit.additional_info.textarea"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeEdit}
              disabled={updateMutation.isPending}
              data-ocid="admin_colis.edit.cancel_button"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateMutation.isPending}
              data-ocid="admin_colis.edit.save_button"
            >
              {updateMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent data-ocid="admin_colis.delete_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le colis</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting && (
                <>
                  Confirmer la suppression du colis{" "}
                  <span className="font-mono">#{deleting.id.toString()}</span> (
                  {deleting.clientName || "sans nom"}) ? Cette action est
                  irréversible.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
              data-ocid="admin_colis.delete.cancel_button"
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="admin_colis.delete.confirm_button"
            >
              {deleteMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
