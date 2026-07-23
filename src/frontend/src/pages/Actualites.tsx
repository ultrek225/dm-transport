import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useNewsPage } from "@/hooks/useQueries";
import {
  AlertCircle,
  ExternalLink,
  Link2,
  MessageCircle,
  Newspaper,
  Send,
} from "lucide-react";
import { motion } from "motion/react";

export function Actualites() {
  const { data, isLoading, isError } = useNewsPage();

  const hasContent =
    !isLoading &&
    !isError &&
    data &&
    (data.title.length > 0 ||
      data.description.length > 0 ||
      data.whatsappLink.length > 0 ||
      data.links.length > 0);

  return (
    <div className="animate-fade-in">
      {/* ----------------------------------------------------------------- */}
      {/* Page header — title + description                                  */}
      {/* ----------------------------------------------------------------- */}
      <section className="border-b border-border bg-card">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <Newspaper className="size-3.5" />
              Actualités
            </span>

            {isLoading ? (
              <div className="mt-5 space-y-3">
                <Skeleton className="h-10 w-72" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
              </div>
            ) : isError ? null : (
              <>
                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="mt-5 font-display text-3xl font-semibold tracking-tight md:text-4xl"
                >
                  {data?.title?.length ? data.title : "Actualités"}
                </motion.h1>
                {data?.description?.length ? (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.05 }}
                    className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg"
                  >
                    {data.description}
                  </motion.p>
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Content — WhatsApp CTA + useful links                              */}
      {/* ----------------------------------------------------------------- */}
      <section className="bg-background">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl space-y-10">
            {isLoading ? (
              <LoadingState />
            ) : isError ? (
              <ErrorState />
            ) : !hasContent ? (
              <EmptyState />
            ) : (
              <>
                {/* WhatsApp official link — prominent CTA */}
                {data?.whatsappLink?.length ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="overflow-hidden border-accent/30 bg-accent/5">
                      <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-8">
                        <div className="flex items-start gap-4">
                          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                            <MessageCircle className="size-6" />
                          </span>
                          <div className="min-w-0">
                            <h2 className="font-display text-lg font-semibold text-foreground">
                              Canal WhatsApp officiel
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Rejoignez le canal officiel pour recevoir les
                              annonces en temps réel.
                            </p>
                          </div>
                        </div>
                        <Button
                          asChild
                          size="lg"
                          className="bg-accent text-accent-foreground hover:bg-accent/90"
                          data-ocid="actualites.whatsapp_button"
                        >
                          <a
                            href={data.whatsappLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Send className="size-4" />
                            Rejoindre WhatsApp
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : null}

                {/* Useful links list */}
                {data?.links?.length ? (
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <Link2 className="size-4 text-muted-foreground" />
                      <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Liens utiles
                      </h2>
                      <Badge variant="secondary" className="ml-1">
                        {data.links.length}
                      </Badge>
                    </div>
                    <Separator className="mb-4" />
                    <ul className="space-y-3">
                      {data.links.map((link, i) => (
                        <motion.li
                          key={link.id.toString()}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.25, delay: i * 0.06 }}
                        >
                          <Card className="transition-colors hover:border-accent/40">
                            <CardContent className="flex items-center justify-between gap-4 p-4 md:p-5">
                              <div className="flex min-w-0 items-center gap-3">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                                  <ExternalLink className="size-4" />
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate font-medium text-foreground">
                                    {link.linkLabel}
                                  </p>
                                  <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                                    {link.url}
                                  </p>
                                </div>
                              </div>
                              <Button
                                asChild
                                size="sm"
                                variant="outline"
                                data-ocid={`actualites.link.${i + 1}`}
                              >
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Ouvrir
                                </a>
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

function LoadingState() {
  return (
    <div className="space-y-6" data-ocid="actualites.loading_state">
      <Skeleton className="h-28 w-full rounded-lg" />
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <Card
      className="mx-auto max-w-xl border-destructive/30"
      data-ocid="actualites.error_state"
    >
      <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-md bg-destructive/10 text-destructive">
          <AlertCircle className="size-6" />
        </span>
        <p className="font-medium text-foreground">
          Actualités temporairement indisponibles
        </p>
        <p className="text-sm text-muted-foreground">
          Une erreur est survenue lors du chargement. Veuillez réessayer
          ultérieurement.
        </p>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="mx-auto max-w-xl" data-ocid="actualites.empty_state">
      <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
          <Newspaper className="size-6" />
        </span>
        <p className="font-medium text-foreground">Aucune actualité publiée</p>
        <p className="text-sm text-muted-foreground">
          Revenez bientôt pour consulter les dernières informations de la
          plateforme.
        </p>
      </CardContent>
    </Card>
  );
}
