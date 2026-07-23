import {
  type Parcel,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useDeleteMyParcel,
  useMyParcel,
  useUpdateMyParcel,
} from "@/hooks/useQueries";
import { PARCEL_STATUS_BADGE_CLASS, PARCEL_STATUS_LABELS } from "@/types";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Package,
  Pencil,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const STATUS_VALUES: ParcelStatus[] = [
  ParcelStatus.pending,
  ParcelStatus.inTransit,
  ParcelStatus.delivered,
];

function formatDate(nanos: bigint | number): string {
  const ms = Number(nanos) / 1_000_000;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InfoRow({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={
          highlight
            ? "font-mono text-sm font-semibold text-accent"
            : mono
              ? "font-mono text-sm text-foreground"
              : "text-sm text-foreground"
        }
      >
        {value || "—"}
      </p>
    </div>
  );
}

export function ColisDetail() {
  const { id } = useParams({ from: "/transporteur/colis/$id" });
  const parcelId: ParcelId = BigInt(id);
  const { data: parcel, isLoading, isError, error } = useMyParcel(parcelId);
  const updateMutation = useUpdateMyParcel();
  const deleteMutation = useDeleteMyParcel();
  const navigate = useNavigate();

  const [status, setStatus] = useState<ParcelStatus | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Edit form state
  const [clientName, setClientName] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [parcelType, setParcelType] = useState("");
  const [parcelCount, setParcelCount] = useState("1");
  const [additionalInfo, setAdditionalInfo] = useState("");

  useEffect(() => {
    if (parcel) {
      setStatus(parcel.status);
      setClientName(parcel.clientName);
      setDestinationAddress(parcel.destinationAddress);
      setClientPhone(parcel.clientPhone);
      setParcelType(parcel.parcelType);
      setParcelCount(parcel.parcelCount.toString());
      setAdditionalInfo(parcel.additionalInfo);
    }
  }, [parcel]);

  const currentStatus = status ?? parcel?.status ?? ParcelStatus.pending;

  const handleStatusChange = (newStatus: ParcelStatus) => {
    const update: ParcelUpdate = { status: newStatus };
    updateMutation.mutate(
      { id: parcelId, update },
      {
        onSuccess: () => {
          setStatus(newStatus);
          toast.success("Statut mis à jour.");
        },
        onError: (err) =>
          toast.error(err.message || "Échec de la mise à jour du statut."),
      },
    );
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !destinationAddress.trim()) {
      toast.error(
        "Le nom du client et l'adresse de destination sont obligatoires.",
      );
      return;
    }
    const count = BigInt(parcelCount || "1");
    if (count <= 0n) {
      toast.error("Le nombre de colis doit être supérieur à zéro.");
      return;
    }
    const update: ParcelUpdate = {
      clientName: clientName.trim(),
      destinationAddress: destinationAddress.trim(),
      clientPhone: clientPhone.trim(),
      parcelType: parcelType.trim(),
      parcelCount: count,
      additionalInfo: additionalInfo.trim(),
    };
    updateMutation.mutate(
      { id: parcelId, update },
      {
        onSuccess: () => {
          toast.success("Colis modifié.");
          setEditMode(false);
        },
        onError: (err) =>
          toast.error(err.message || "Échec de la modification du colis."),
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(parcelId, {
      onSuccess: () => {
        toast.success("Colis supprimé.");
        navigate({ to: "/transporteur" });
      },
      onError: (err) =>
        toast.error(err.message || "Échec de la suppression du colis."),
    });
  };

  const goBack = () => navigate({ to: "/transporteur" });

  return (
    <div className="animate-fade-in">
      <section className="border-b border-border bg-card">
        <div className="container py-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            data-ocid="colis_detail.back_button"
          >
            <ArrowLeft className="size-4" />
            Retour
          </Button>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight">
                Détail du colis
              </h1>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                #{id}
              </p>
            </div>
            {parcel && !editMode && (
              <Badge
                className={PARCEL_STATUS_BADGE_CLASS[currentStatus]}
                data-ocid="colis_detail.status_badge"
              >
                {PARCEL_STATUS_LABELS[currentStatus]}
              </Badge>
            )}
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="container py-10">
          {isLoading ? (
            <div className="mx-auto max-w-2xl space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : isError ? (
            <Card
              className="mx-auto max-w-2xl"
              data-ocid="colis_detail.error_state"
            >
              <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                <span className="flex size-12 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                  <AlertCircle className="size-6" />
                </span>
                <p className="font-medium text-foreground">
                  Impossible de charger le colis
                </p>
                <p className="text-sm text-muted-foreground">
                  {error?.message ||
                    "Une erreur est survenue lors du chargement."}
                </p>
                <Button variant="outline" onClick={goBack}>
                  Retour à la liste
                </Button>
              </CardContent>
            </Card>
          ) : !parcel ? (
            <Card
              className="mx-auto max-w-2xl"
              data-ocid="colis_detail.empty_state"
            >
              <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                <span className="flex size-12 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                  <Package className="size-6" />
                </span>
                <p className="font-medium text-foreground">Colis introuvable</p>
                <p className="text-sm text-muted-foreground">
                  Ce colis n'existe pas ou ne vous appartient pas.
                </p>
                <Button variant="outline" onClick={goBack}>
                  Retour à la liste
                </Button>
              </CardContent>
            </Card>
          ) : editMode ? (
            <Card className="mx-auto max-w-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Pencil className="size-5" />
                  Modifier le colis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEditSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client *</Label>
                    <Input
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Nom du client"
                      required
                      data-ocid="colis_detail.client_name.input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destinationAddress">
                      Adresse de destination *
                    </Label>
                    <Textarea
                      id="destinationAddress"
                      value={destinationAddress}
                      onChange={(e) => setDestinationAddress(e.target.value)}
                      placeholder="Adresse de livraison"
                      required
                      data-ocid="colis_detail.destination_address.textarea"
                    />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="clientPhone">Téléphone</Label>
                      <Input
                        id="clientPhone"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="Numéro de téléphone"
                        data-ocid="colis_detail.client_phone.input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parcelType">Type de colis</Label>
                      <Input
                        id="parcelType"
                        value={parcelType}
                        onChange={(e) => setParcelType(e.target.value)}
                        placeholder="Type de marchandise"
                        data-ocid="colis_detail.parcel_type.input"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parcelCount">Nombre de colis</Label>
                    <Input
                      id="parcelCount"
                      type="number"
                      min="1"
                      value={parcelCount}
                      onChange={(e) => setParcelCount(e.target.value)}
                      data-ocid="colis_detail.parcel_count.input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="additionalInfo">
                      Informations complémentaires
                    </Label>
                    <Textarea
                      id="additionalInfo"
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      placeholder="Instructions de livraison (optionnel)"
                      data-ocid="colis_detail.additional_info.textarea"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditMode(false)}
                      disabled={updateMutation.isPending}
                      data-ocid="colis_detail.cancel_button"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateMutation.isPending}
                      data-ocid="colis_detail.save_button"
                    >
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Enregistrement…
                        </>
                      ) : (
                        "Enregistrer les modifications"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="mx-auto max-w-2xl space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="size-5" />
                    {parcel.clientName || "Colis"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-md border border-accent/30 bg-accent/5 p-3">
                    <InfoRow
                      label="Code unique"
                      value={parcel.trackingCode}
                      mono
                      highlight
                    />
                  </div>
                  <InfoRow label="Expéditeur" value={parcel.senderName} />
                  <Separator />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoRow label="Client" value={parcel.clientName} />
                    <InfoRow
                      label="Téléphone"
                      value={parcel.clientPhone}
                      mono
                    />
                    <InfoRow label="Type de colis" value={parcel.parcelType} />
                    <InfoRow
                      label="Nombre de colis"
                      value={parcel.parcelCount.toString()}
                    />
                  </div>
                  <Separator />
                  <InfoRow
                    label="Adresse de destination"
                    value={parcel.destinationAddress}
                  />
                  <Separator />
                  <InfoRow
                    label="Informations complémentaires"
                    value={parcel.additionalInfo}
                  />
                  <Separator />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoRow
                      label="Créé le"
                      value={formatDate(parcel.createdAt)}
                    />
                    <InfoRow
                      label="Mis à jour le"
                      value={formatDate(parcel.updatedAt)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Mettre à jour le statut
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Statut du colis</Label>
                    <Select
                      value={currentStatus}
                      onValueChange={(v) =>
                        handleStatusChange(v as ParcelStatus)
                      }
                      disabled={updateMutation.isPending}
                    >
                      <SelectTrigger
                        id="status"
                        data-ocid="colis_detail.status.select"
                      >
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_VALUES.map((s) => (
                          <SelectItem
                            key={s}
                            value={s}
                            data-ocid={`colis_detail.status.option.${s}`}
                          >
                            {PARCEL_STATUS_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {updateMutation.isPending && (
                    <p
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                      data-ocid="colis_detail.status.loading_state"
                    >
                      <Loader2 className="size-3 animate-spin" />
                      Mise à jour en cours…
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-wrap justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={() => setEditMode(true)}
                  data-ocid="colis_detail.edit_button"
                >
                  <Pencil className="size-4" />
                  Modifier
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={deleteMutation.isPending}
                      data-ocid="colis_detail.delete_button"
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                      Supprimer
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent data-ocid="colis_detail.delete_dialog">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer ce colis ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Le colis #{id} sera
                        définitivement supprimé.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-ocid="colis_detail.delete.cancel_button">
                        Annuler
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        data-ocid="colis_detail.delete.confirm_button"
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
