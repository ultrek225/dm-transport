import type { NewsLink, NewsLinkInput, NewsPageInput } from "@/backend";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddNewsLink,
  useDeleteNewsLink,
  useNewsPage,
  useUpdateNewsLink,
  useUpdateNewsPage,
} from "@/hooks/useQueries";
import { Loader2, Newspaper, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EditLinkState {
  id: bigint;
  linkLabel: string;
  url: string;
}

export function AdminActualites() {
  const { data, isLoading } = useNewsPage();
  const updatePageMutation = useUpdateNewsPage();
  const addLinkMutation = useAddNewsLink();
  const updateLinkMutation = useUpdateNewsLink();
  const deleteLinkMutation = useDeleteNewsLink();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const [editLink, setEditLink] = useState<EditLinkState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NewsLink | null>(null);

  useEffect(() => {
    if (data) {
      setTitle(data.title ?? "");
      setDescription(data.description ?? "");
      setWhatsappLink(data.whatsappLink ?? "");
    }
  }, [data]);

  const handleSavePage = () => {
    if (!title.trim()) {
      toast.error("Le titre est obligatoire.");
      return;
    }
    const input: NewsPageInput = {
      title: title.trim(),
      description: description.trim(),
      whatsappLink: whatsappLink.trim(),
    };
    updatePageMutation.mutate(input, {
      onSuccess: () => toast.success("Page actualités mise à jour."),
      onError: (err) => toast.error(err.message || "Échec de la mise à jour."),
    });
  };

  const handleAddLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) {
      toast.error("Le libellé et l'URL sont obligatoires.");
      return;
    }
    const input: NewsLinkInput = {
      linkLabel: newLinkLabel.trim(),
      url: newLinkUrl.trim(),
    };
    addLinkMutation.mutate(input, {
      onSuccess: () => {
        setNewLinkLabel("");
        setNewLinkUrl("");
        toast.success("Lien ajouté.");
      },
      onError: (err) => toast.error(err.message || "Échec de l'ajout."),
    });
  };

  const openEditDialog = (link: NewsLink) => {
    setEditLink({
      id: link.id,
      linkLabel: link.linkLabel,
      url: link.url,
    });
  };

  const handleSaveLink = () => {
    if (!editLink) return;
    if (!editLink.linkLabel.trim() || !editLink.url.trim()) {
      toast.error("Le libellé et l'URL sont obligatoires.");
      return;
    }
    const input: NewsLinkInput = {
      linkLabel: editLink.linkLabel.trim(),
      url: editLink.url.trim(),
    };
    updateLinkMutation.mutate(
      { id: editLink.id, input },
      {
        onSuccess: () => {
          toast.success("Lien mis à jour.");
          setEditLink(null);
        },
        onError: (err) =>
          toast.error(err.message || "Échec de la mise à jour."),
      },
    );
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteLinkMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Lien supprimé.");
        setDeleteTarget(null);
      },
      onError: (err) => toast.error(err.message || "Échec de la suppression."),
    });
  };

  return (
    <div className="animate-fade-in">
      <section className="border-b border-border bg-card">
        <div className="container py-10">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Actualités
          </h1>
          <p className="mt-2 text-muted-foreground">
            Modifiez le titre, la description, le lien WhatsApp et les liens de
            la page actualités.
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="container py-10 space-y-6">
          {isLoading ? (
            <div className="max-w-2xl space-y-4">
              <Skeleton className="h-72 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <>
              <Card className="max-w-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Newspaper className="size-5" />
                    Contenu de la page
                  </CardTitle>
                  <CardDescription>
                    Ces champs apparaissent en haut de la page actualités
                    publique.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Titre de la page actualités"
                      data-ocid="admin_actualites.title.input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Description affichée sous le titre"
                      rows={5}
                      data-ocid="admin_actualites.description.textarea"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsappLink">Lien WhatsApp</Label>
                    <Input
                      id="whatsappLink"
                      value={whatsappLink}
                      onChange={(e) => setWhatsappLink(e.target.value)}
                      placeholder="https://chat.whatsapp.com/…"
                      data-ocid="admin_actualites.whatsapp_link.input"
                    />
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button
                      disabled={updatePageMutation.isPending}
                      onClick={handleSavePage}
                      data-ocid="admin_actualites.save_button"
                    >
                      {updatePageMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : null}
                      Enregistrer
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="max-w-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">Liens</CardTitle>
                  <CardDescription>
                    Gérez la liste des liens affichés sur la page actualités.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data?.links && data.links.length > 0 ? (
                    <ul
                      className="space-y-2"
                      data-ocid="admin_actualites.link.list"
                    >
                      {data.links.map((link, i) => (
                        <li
                          key={link.id.toString()}
                          className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/30 p-3"
                          data-ocid={`admin_actualites.link.item.${i + 1}`}
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {link.linkLabel}
                            </p>
                            <p className="truncate font-mono text-xs text-muted-foreground">
                              {link.url}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(link)}
                              data-ocid={`admin_actualites.edit_link_button.${i + 1}`}
                              aria-label={`Modifier le lien ${link.linkLabel}`}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteTarget(link)}
                              data-ocid={`admin_actualites.delete_link_button.${i + 1}`}
                              aria-label={`Supprimer le lien ${link.linkLabel}`}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p
                      className="text-sm text-muted-foreground"
                      data-ocid="admin_actualites.link.empty_state"
                    >
                      Aucun lien pour le moment.
                    </p>
                  )}

                  <Separator />

                  <div className="space-y-3 rounded-md border border-dashed border-border p-4">
                    <p className="text-sm font-medium text-foreground">
                      Ajouter un lien
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="newLinkLabel">Libellé</Label>
                        <Input
                          id="newLinkLabel"
                          placeholder="Ex. Suivez-nous"
                          value={newLinkLabel}
                          onChange={(e) => setNewLinkLabel(e.target.value)}
                          data-ocid="admin_actualites.new_link_label.input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newLinkUrl">URL</Label>
                        <Input
                          id="newLinkUrl"
                          placeholder="https://…"
                          value={newLinkUrl}
                          onChange={(e) => setNewLinkUrl(e.target.value)}
                          data-ocid="admin_actualites.new_link_url.input"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        disabled={addLinkMutation.isPending}
                        onClick={handleAddLink}
                        data-ocid="admin_actualites.add_link_button"
                      >
                        {addLinkMutation.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Plus className="size-4" />
                        )}
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>

      {/* Edit link dialog */}
      <Dialog
        open={editLink !== null}
        onOpenChange={(open) => !open && setEditLink(null)}
      >
        <DialogContent data-ocid="admin_actualites.edit_link.dialog">
          <DialogHeader>
            <DialogTitle>Modifier le lien</DialogTitle>
            <DialogDescription>
              Mettez à jour le libellé et l'URL du lien.
            </DialogDescription>
          </DialogHeader>
          {editLink ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editLinkLabel">Libellé</Label>
                <Input
                  id="editLinkLabel"
                  value={editLink.linkLabel}
                  onChange={(e) =>
                    setEditLink({ ...editLink, linkLabel: e.target.value })
                  }
                  data-ocid="admin_actualites.edit_link_label.input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLinkUrl">URL</Label>
                <Input
                  id="editLinkUrl"
                  value={editLink.url}
                  onChange={(e) =>
                    setEditLink({ ...editLink, url: e.target.value })
                  }
                  data-ocid="admin_actualites.edit_link_url.input"
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                data-ocid="admin_actualites.edit_link.cancel_button"
              >
                Annuler
              </Button>
            </DialogClose>
            <Button
              disabled={updateLinkMutation.isPending}
              onClick={handleSaveLink}
              data-ocid="admin_actualites.edit_link.save_button"
            >
              {updateLinkMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="admin_actualites.delete_link.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce lien ?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `Le lien « ${deleteTarget.linkLabel} » sera définitivement supprimé.`
                : "Cette action est irréversible."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin_actualites.delete_link.cancel_button">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteLinkMutation.isPending}
              onClick={confirmDelete}
              data-ocid="admin_actualites.delete_link.confirm_button"
            >
              {deleteLinkMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
