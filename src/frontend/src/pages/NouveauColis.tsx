import type { Parcel, ParcelId, ParcelInput, ParcelUpdate } from "@/backend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useMyParcel,
  useRegisterParcel,
  useUpdateMyParcel,
} from "@/hooks/useQueries";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Loader2, Package } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// Edit mode is opt-in via the `?id=<nat>` search param on the same route.
interface ParcelSearch {
  id?: string;
}

interface ParcelFormValues {
  trackingCode: string;
  senderName: string;
  clientName: string;
  parcelCount: number;
  parcelType: string;
  destinationAddress: string;
  clientPhone: string;
  additionalInfo: string;
}

const EMPTY_VALUES: ParcelFormValues = {
  trackingCode: "",
  senderName: "",
  clientName: "",
  parcelCount: 1,
  parcelType: "",
  destinationAddress: "",
  clientPhone: "",
  additionalInfo: "",
};

function parcelToValues(parcel: Parcel): ParcelFormValues {
  return {
    trackingCode: parcel.trackingCode,
    senderName: parcel.senderName,
    clientName: parcel.clientName,
    parcelCount: Number(parcel.parcelCount),
    parcelType: parcel.parcelType,
    destinationAddress: parcel.destinationAddress,
    clientPhone: parcel.clientPhone,
    additionalInfo: parcel.additionalInfo,
  };
}

function valuesToInput(values: ParcelFormValues): ParcelInput {
  return {
    trackingCode: values.trackingCode.trim(),
    senderName: values.senderName.trim(),
    clientName: values.clientName.trim(),
    parcelCount: BigInt(values.parcelCount),
    parcelType: values.parcelType.trim(),
    destinationAddress: values.destinationAddress.trim(),
    clientPhone: values.clientPhone.trim(),
    additionalInfo: values.additionalInfo.trim(),
  };
}

function valuesToUpdate(values: ParcelFormValues): ParcelUpdate {
  return {
    trackingCode: values.trackingCode.trim(),
    senderName: values.senderName.trim(),
    clientName: values.clientName.trim(),
    parcelCount: BigInt(values.parcelCount),
    parcelType: values.parcelType.trim(),
    destinationAddress: values.destinationAddress.trim(),
    clientPhone: values.clientPhone.trim(),
    additionalInfo: values.additionalInfo.trim(),
  };
}

export function NouveauColis() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as ParcelSearch;
  const editId: ParcelId | null =
    search.id && /^\d+$/.test(search.id) ? BigInt(search.id) : null;
  const isEditMode = editId !== null;

  const registerMutation = useRegisterParcel();
  const updateMutation = useUpdateMyParcel();
  const { data: existingParcel, isLoading: isLoadingParcel } = useMyParcel(
    isEditMode ? editId : null,
  );

  const form = useForm<ParcelFormValues>({
    defaultValues: EMPTY_VALUES,
    mode: "onBlur",
  });

  // Pre-fill the form once the existing parcel is loaded in edit mode.
  useEffect(() => {
    if (isEditMode && existingParcel) {
      form.reset(parcelToValues(existingParcel));
    }
  }, [isEditMode, existingParcel, form]);

  const isPending = registerMutation.isPending || updateMutation.isPending;

  const handleSubmit = (values: ParcelFormValues) => {
    if (isEditMode && editId !== null) {
      updateMutation.mutate(
        { id: editId, update: valuesToUpdate(values) },
        {
          onSuccess: () => {
            toast.success("Colis mis à jour.");
            navigate({ to: "/transporteur" });
          },
          onError: (err) => {
            toast.error(err.message || "Échec de la mise à jour du colis.");
          },
        },
      );
      return;
    }

    registerMutation.mutate(valuesToInput(values), {
      onSuccess: () => {
        toast.success("Colis enregistré.");
        navigate({ to: "/transporteur" });
      },
      onError: (err) => {
        toast.error(err.message || "Échec de l'enregistrement du colis.");
      },
    });
  };

  const handleCancel = () => navigate({ to: "/transporteur" });

  const title = isEditMode ? "Modifier le colis" : "Nouveau colis";
  const subtitle = isEditMode
    ? "Mettez à jour les informations du client et de la livraison."
    : "Renseignez les informations du client et de la livraison.";
  const submitLabel = isEditMode
    ? "Enregistrer les modifications"
    : "Enregistrer le colis";
  const pendingLabel = isEditMode ? "Mise à jour…" : "Enregistrement…";

  return (
    <div className="animate-fade-in">
      <section className="border-b border-border bg-card">
        <div className="container py-10">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-muted-foreground">{subtitle}</p>
        </div>
      </section>

      <section className="bg-background">
        <div className="container py-10">
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="size-5" />
                Informations du colis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditMode && isLoadingParcel ? (
                <div
                  className="flex items-center justify-center gap-3 py-12 text-muted-foreground"
                  data-ocid="nouveau_colis.loading_state"
                >
                  <Loader2 className="size-5 animate-spin" />
                  <span>Chargement du colis…</span>
                </div>
              ) : (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-5"
                  >
                    <FormField
                      control={form.control}
                      name="senderName"
                      rules={{
                        required: "Le nom de l'expéditeur est obligatoire.",
                        maxLength: {
                          value: 200,
                          message:
                            "L'expéditeur ne peut pas dépasser 200 caractères.",
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="senderName">
                            Nom de l'expéditeur *
                          </FormLabel>
                          <FormControl>
                            <Input
                              id="senderName"
                              placeholder="Nom de l'expéditeur"
                              autoComplete="organization"
                              data-ocid="nouveau_colis.sender_name.input"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="trackingCode"
                      rules={{
                        required: isEditMode
                          ? "Le code unique est obligatoire."
                          : false,
                        maxLength: {
                          value: 100,
                          message:
                            "Le code unique ne peut pas dépasser 100 caractères.",
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="trackingCode">
                            Code unique
                            {!isEditMode && (
                              <span className="font-normal text-muted-foreground">
                                {" "}
                                (optionnel)
                              </span>
                            )}
                          </FormLabel>
                          <FormControl>
                            <Input
                              id="trackingCode"
                              placeholder="Code de suivi du colis"
                              className="font-mono"
                              data-ocid="nouveau_colis.tracking_code.input"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-sm text-muted-foreground">
                            {isEditMode
                              ? "Modifiez le code de suivi si nécessaire."
                              : "Laissez vide pour générer automatiquement le code à partir du nom de l'expéditeur, ou saisissez-le manuellement."}
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clientName"
                      rules={{
                        required: "Le nom du client est obligatoire.",
                        maxLength: {
                          value: 200,
                          message:
                            "Le nom du client ne peut pas dépasser 200 caractères.",
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="clientName">
                            Nom du client *
                          </FormLabel>
                          <FormControl>
                            <Input
                              id="clientName"
                              placeholder="Nom du client"
                              autoComplete="name"
                              data-ocid="nouveau_colis.client_name.input"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="destinationAddress"
                      rules={{
                        required: "L'adresse de destination est obligatoire.",
                        maxLength: {
                          value: 500,
                          message:
                            "L'adresse ne peut pas dépasser 500 caractères.",
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="destinationAddress">
                            Adresse de destination *
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              id="destinationAddress"
                              placeholder="Adresse de livraison"
                              rows={3}
                              data-ocid="nouveau_colis.destination_address.textarea"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="clientPhone"
                        rules={{
                          required: "Le numéro client est obligatoire.",
                          maxLength: {
                            value: 40,
                            message:
                              "Le numéro ne peut pas dépasser 40 caractères.",
                          },
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="clientPhone">
                              Numéro client *
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="clientPhone"
                                placeholder="Numéro de téléphone"
                                autoComplete="tel"
                                data-ocid="nouveau_colis.client_phone.input"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="parcelType"
                        rules={{
                          required: "Le type de colis est obligatoire.",
                          maxLength: {
                            value: 100,
                            message:
                              "Le type ne peut pas dépasser 100 caractères.",
                          },
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="parcelType">Type *</FormLabel>
                            <FormControl>
                              <Input
                                id="parcelType"
                                placeholder="Type de marchandise"
                                data-ocid="nouveau_colis.parcel_type.input"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="parcelCount"
                      rules={{
                        required: "Le nombre de colis est obligatoire.",
                        min: {
                          value: 1,
                          message:
                            "Le nombre de colis doit être supérieur à zéro.",
                        },
                        validate: (value) =>
                          Number.isInteger(value) ||
                          "Le nombre de colis doit être un entier.",
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="parcelCount">
                            Nombre de colis *
                          </FormLabel>
                          <FormControl>
                            <Input
                              id="parcelCount"
                              type="number"
                              min="1"
                              step="1"
                              placeholder="1"
                              data-ocid="nouveau_colis.parcel_count.input"
                              value={
                                field.value === undefined ||
                                field.value === null
                                  ? ""
                                  : field.value
                              }
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value),
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="additionalInfo"
                      rules={{
                        maxLength: {
                          value: 1000,
                          message:
                            "Les informations complémentaires ne peuvent pas dépasser 1000 caractères.",
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="additionalInfo">
                            Informations complémentaires
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              id="additionalInfo"
                              placeholder="Instructions de livraison (optionnel)"
                              rows={3}
                              data-ocid="nouveau_colis.additional_info.textarea"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isPending}
                        data-ocid="nouveau_colis.cancel_button"
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        disabled={isPending}
                        data-ocid="nouveau_colis.submit_button"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            {pendingLabel}
                          </>
                        ) : (
                          submitLabel
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
