import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, LogIn, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

export function Connexion() {
  const { login, isLoading, isAuthenticated, role } = useAuth();

  return (
    <div className="container flex min-h-[calc(100vh-12rem)] items-center justify-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-elevated">
          <CardHeader className="text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="size-6" />
            </span>
            <CardTitle className="mt-4 text-2xl">Connexion</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Authentifiez-vous avec Internet Identity pour accéder à votre
              espace.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              size="lg"
              onClick={login}
              disabled={isLoading}
              data-ocid="connexion.login_button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Connexion en cours…
                </>
              ) : (
                <>
                  <LogIn className="size-4" />
                  Se connecter avec Internet Identity
                </>
              )}
            </Button>

            {isAuthenticated && (
              <p className="text-center text-sm text-muted-foreground">
                Vous êtes connecté. Redirection vers votre espace{" "}
                {role === "admin" ? "administrateur" : "transporteur"}…
              </p>
            )}

            <div className="rounded-md border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">À savoir</p>
              <p className="mt-1">
                À votre première connexion, vous êtes automatiquement inscrit
                comme transporteur. Un administrateur doit ensuite valider votre
                compte avant que vous puissiez enregistrer des colis.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
