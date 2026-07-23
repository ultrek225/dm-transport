import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Package, Search, ShieldCheck, Truck } from "lucide-react";
import { motion } from "motion/react";

const FEATURES = [
  {
    icon: Package,
    title: "Suivi des colis",
    description:
      "Enregistrez vos colis et suivez leur statut en temps réel : en attente, en cours, livré.",
  },
  {
    icon: ShieldCheck,
    title: "Validation admin",
    description:
      "Chaque transporteur est inscrit via Internet Identity puis validé par l'administrateur avant d'opérer.",
  },
  {
    icon: Search,
    title: "Recherche & filtrage",
    description:
      "L'administrateur recherche et filtre l'ensemble des colis par statut, date ou client.",
  },
  {
    icon: Truck,
    title: "Confidentialité",
    description:
      "Les transporteurs ne voient que leurs propres colis. Vos données restent privées.",
  },
] as const;

const STEPS = [
  {
    n: "01",
    title: "Connexion Internet Identity",
    description:
      "Authentifiez-vous en un clic avec Internet Identity, sans mot de passe.",
  },
  {
    n: "02",
    title: "Inscription automatique",
    description:
      "Vous êtes enregistré comme transporteur, en attente de validation admin.",
  },
  {
    n: "03",
    title: "Gestion des colis",
    description:
      "Une fois validé, créez et suivez vos colis depuis votre espace dédié.",
  },
] as const;

export function Home() {
  const { isAuthenticated, role, login } = useAuth();

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-card">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.55_0.07_235/0.08),transparent)]" />
        <div className="container py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <span className="size-1.5 rounded-full bg-accent" />
              Plateforme de suivi de colis
            </span>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 font-display text-4xl font-semibold tracking-tight md:text-6xl"
            >
              DM Transport
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="mt-5 text-lg text-muted-foreground md:text-xl"
            >
              Gérez et suivez vos colis en toute simplicité. Inscription via
              Internet Identity, validation admin, suivi en temps réel.
            </motion.p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {isAuthenticated ? (
                <Button asChild size="lg" data-ocid="home.cta_dashboard">
                  <Link
                    to={role === "admin" ? "/admin/colis" : "/transporteur"}
                  >
                    Accéder à mon espace
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" onClick={login} data-ocid="home.cta_login">
                  Se connecter
                  <ArrowRight className="size-4" />
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                size="lg"
                data-ocid="home.cta_news"
              >
                <Link to="/actualites">Voir les actualités</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-background">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Conçu pour les transporteurs
            </h2>
            <p className="mt-3 text-muted-foreground">
              Une plateforme neutre et professionnelle, centrée sur l'essentiel
              : vos colis.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
              >
                <Card className="h-full transition-shadow hover:shadow-elevated">
                  <CardHeader>
                    <span className="flex size-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                      <feature.icon className="size-5" />
                    </span>
                    <CardTitle className="mt-4 text-base">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="border-y border-border bg-muted/30">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Comment ça marche
            </h2>
            <p className="mt-3 text-muted-foreground">
              Trois étapes pour rejoindre la plateforme.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.1 }}
                className="relative rounded-lg border border-border bg-card p-6 shadow-subtle"
              >
                <span className="font-mono text-sm font-semibold text-accent">
                  {step.n}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl rounded-lg border border-border bg-card p-10 text-center shadow-subtle">
            <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              Prêt à suivre vos colis ?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Connectez-vous avec Internet Identity pour commencer.
            </p>
            <div className="mt-6 flex justify-center">
              {isAuthenticated ? (
                <Button asChild size="lg" data-ocid="home.cta_bottom_dashboard">
                  <Link
                    to={role === "admin" ? "/admin/colis" : "/transporteur"}
                  >
                    Accéder à mon espace
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={login}
                  data-ocid="home.cta_bottom_login"
                >
                  Se connecter
                  <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
