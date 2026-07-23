import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";

/**
 * Provides typed access to the backend actor.
 *
 * Returns `{ actor, isFetching }` where `actor` is the fully-typed
 * `Backend` instance (or `null` while the actor is being created).
 *
 * All data operations should go through `hooks/useQueries.ts`, which
 * builds React Query hooks on top of this actor.
 */
export function useBackend() {
  const { actor, isFetching } = useActor(createActor);
  return { actor, isFetching };
}
