import {
  type DashboardStats as BackendDashboardStats,
  type NewsLink,
  type NewsLinkInput,
  type NewsPage,
  type NewsPageInput,
  type Parcel,
  type ParcelFilter,
  type ParcelId,
  type ParcelInput,
  ParcelStatus,
  type ParcelUpdate,
  type TransporterProfile,
  TransporterStatus,
} from "@/backend";
import { useBackend } from "@/hooks/useBackend";
import { type DashboardStats, toDashboardStats } from "@/types";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ---------------------------------------------------------------------------
// Transporters
// ---------------------------------------------------------------------------

export function useMyTransporterProfile() {
  const { actor, isFetching } = useBackend();
  return useQuery<TransporterProfile | null>({
    queryKey: ["myTransporterProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyTransporterProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListTransporters() {
  const { actor, isFetching } = useBackend();
  return useQuery<TransporterProfile[]>({
    queryKey: ["transporters"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTransporters();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListTransportersByStatus(status: TransporterStatus) {
  const { actor, isFetching } = useBackend();
  return useQuery<TransporterProfile[]>({
    queryKey: ["transporters", status],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTransportersByStatus(status);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterAsTransporter() {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation<TransporterProfile, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend non disponible");
      return actor.registerAsTransporter();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTransporterProfile"] });
      queryClient.invalidateQueries({ queryKey: ["transporters"] });
    },
  });
}

export function useValidateTransporter() {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation<TransporterProfile | null, Error, Principal>({
    mutationFn: async (principal) => {
      if (!actor) throw new Error("Backend non disponible");
      return actor.validateTransporter(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transporters"] });
    },
  });
}

export function useRejectTransporter() {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation<TransporterProfile | null, Error, Principal>({
    mutationFn: async (principal) => {
      if (!actor) throw new Error("Backend non disponible");
      return actor.rejectTransporter(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transporters"] });
    },
  });
}

export function useRevokeTransporter() {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation<TransporterProfile | null, Error, Principal>({
    mutationFn: async (principal) => {
      if (!actor) throw new Error("Backend non disponible");
      return actor.revokeTransporter(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transporters"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Parcels — transporter scope (own parcels only)
// ---------------------------------------------------------------------------

export function useMyParcels() {
  const { actor, isFetching } = useBackend();
  return useQuery<Parcel[]>({
    queryKey: ["myParcels"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyParcels();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyParcel(id: ParcelId | null) {
  const { actor, isFetching } = useBackend();
  return useQuery<Parcel | null>({
    queryKey: ["myParcel", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getMyParcel(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useRegisterParcel() {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation<ParcelId, Error, ParcelInput>({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Backend non disponible");
      return actor.registerParcel(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myParcels"] });
    },
  });
}

export function useUpdateMyParcel() {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation<
    Parcel | null,
    Error,
    { id: ParcelId; update: ParcelUpdate }
  >({
    mutationFn: async ({ id, update }) => {
      if (!actor) throw new Error("Backend non disponible");
      return actor.updateMyParcel(id, update);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myParcels"] });
      queryClient.invalidateQueries({ queryKey: ["myParcel"] });
    },
  });
}

export function useDeleteMyParcel() {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation<Parcel | null, Error, ParcelId>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Backend non disponible");
      return actor.deleteMyParcel(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myParcels"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Parcels — admin scope (all parcels + search)
// ---------------------------------------------------------------------------

export function useAllParcels() {
  const { actor, isFetching } = useBackend();
  return useQuery<Parcel[]>({
    queryKey: ["allParcels"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllParcels();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchParcels() {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation<Parcel[], Error, ParcelFilter>({
    mutationFn: async (filter) => {
      if (!actor) throw new Error("Backend non disponible");
      return actor.searchParcels(filter);
    },
    // Cache results under a stable key so the UI can read them.
    onSuccess: (data, filter) => {
      queryClient.setQueryData(["searchParcels", filter], data);
    },
  });
}

export function useSearchParcelsQuery(filter: ParcelFilter | null) {
  const { actor, isFetching } = useBackend();
  return useQuery<Parcel[]>({
    queryKey: ["searchParcels", filter],
    queryFn: async () => {
      if (!actor || !filter) return [];
      return actor.searchParcels(filter);
    },
    enabled: !!actor && !isFetching && filter !== null,
  });
}

export function useUpdateAnyParcel() {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation<
    Parcel | null,
    Error,
    { id: ParcelId; update: ParcelUpdate }
  >({
    mutationFn: async ({ id, update }) => {
      if (!actor) throw new Error("Backend non disponible");
      return actor.updateAnyParcel(id, update);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allParcels"] });
      queryClient.invalidateQueries({ queryKey: ["searchParcels"] });
    },
  });
}

export function useDeleteAnyParcel() {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation<Parcel | null, Error, ParcelId>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Backend non disponible");
      return actor.deleteAnyParcel(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allParcels"] });
      queryClient.invalidateQueries({ queryKey: ["searchParcels"] });
    },
  });
}

// ---------------------------------------------------------------------------
// News
// ---------------------------------------------------------------------------

export function useNewsPage() {
  const { actor, isFetching } = useBackend();
  return useQuery<NewsPage>({
    queryKey: ["newsPage"],
    queryFn: async () => {
      if (!actor) throw new Error("Backend non disponible");
      return actor.getNewsPage();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateNewsPage() {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation<void, Error, NewsPageInput>({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Backend non disponible");
      return actor.updateNewsPage(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsPage"] });
    },
  });
}

export function useAddNewsLink() {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation<NewsLink, Error, NewsLinkInput>({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Backend non disponible");
      return actor.addNewsLink(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsPage"] });
    },
  });
}

export function useUpdateNewsLink() {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation<
    NewsLink | null,
    Error,
    { id: bigint; input: NewsLinkInput }
  >({
    mutationFn: async ({ id, input }) => {
      if (!actor) throw new Error("Backend non disponible");
      return actor.updateNewsLink(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsPage"] });
    },
  });
}

export function useDeleteNewsLink() {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation<boolean, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Backend non disponible");
      return actor.deleteNewsLink(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsPage"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Dashboard — admin-only aggregate stats
// ---------------------------------------------------------------------------

export function useDashboardStats() {
  const { actor, isFetching } = useBackend();
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      if (!actor) throw new Error("Backend non disponible");
      const raw: BackendDashboardStats = await actor.getDashboardStats();
      return toDashboardStats(raw);
    },
    enabled: !!actor && !isFetching,
  });
}

// ---------------------------------------------------------------------------
// Role / status helpers
// ---------------------------------------------------------------------------

export function useIsCallerAdmin() {
  const { actor, isFetching } = useBackend();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerTransporterValidated() {
  const { actor, isFetching } = useBackend();
  return useQuery<boolean>({
    queryKey: ["isCallerTransporterValidated"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerTransporterValidated();
    },
    enabled: !!actor && !isFetching,
  });
}

// Re-export enums for convenience in pages.
export { ParcelStatus, TransporterStatus };
