// Shared frontend types — re-exported from generated backend bindings
// so pages import from a single, stable surface.

import type {
  DashboardStats as BackendDashboardStats,
  NewsLink,
  NewsLinkInput,
  NewsPage,
  NewsPageInput,
  Parcel,
  ParcelFilter,
  ParcelId,
  ParcelInput,
  ParcelUpdate,
  Timestamp,
  TransporterProfile,
} from "@/backend";

export type {
  NewsLink,
  NewsLinkInput,
  NewsPage,
  NewsPageInput,
  Parcel,
  ParcelFilter,
  ParcelId,
  ParcelInput,
  ParcelUpdate,
  Timestamp,
  TransporterProfile,
};

// Frontend-friendly dashboard stats: bigint counts → number, Principal → string.
// The backend returns bigint + Principal; pages consume normalized numbers.
export interface DashboardStats {
  totalParcels: number;
  pendingCount: number;
  inTransitCount: number;
  deliveredCount: number;
  byTransporteur: [string, number][];
}

// Adapter: convert backend DashboardStats (bigint/Principal) to frontend shape.
export function toDashboardStats(raw: BackendDashboardStats): DashboardStats {
  return {
    totalParcels: Number(raw.totalParcels),
    pendingCount: Number(raw.pendingCount),
    inTransitCount: Number(raw.inTransitCount),
    deliveredCount: Number(raw.deliveredCount),
    byTransporteur: raw.byTransporteur.map(([principal, count]) => [
      principal.toString(),
      Number(count),
    ]),
  };
}

// Backend enums are runtime values; re-export the enums themselves.
import {
  ParcelStatus as ParcelStatusEnum,
  TransporterStatus as TransporterStatusEnum,
  UserRole as UserRoleEnum,
} from "@/backend";

export const ParcelStatus = ParcelStatusEnum;
export const TransporterStatus = TransporterStatusEnum;
export const UserRole = UserRoleEnum;

export type ParcelStatus = ParcelStatusEnum;
export type TransporterStatus = TransporterStatusEnum;
export type UserRole = UserRoleEnum;

export type ParcelStatusValue = `${ParcelStatusEnum}`;
export type TransporterStatusValue = `${TransporterStatusEnum}`;
export type UserRoleValue = `${UserRoleEnum}`;

// App-level role derived from backend + transporter validation state.
// `transporter` = authenticated, registered & validated transporter.
// `transporter-pending` = registered but not yet validated by admin.
// `admin` = backend reports admin role.
// `guest` = not authenticated.
export type AppRole = "guest" | "admin" | "transporter" | "transporter-pending";

export interface AuthState {
  isAuthenticated: boolean;
  principal: string | null;
  role: AppRole;
  transporterProfile: TransporterProfile | null;
  isLoading: boolean;
}

// French labels for status enums (used by badges, selects, filters).
export const PARCEL_STATUS_LABELS: Record<ParcelStatusEnum, string> = {
  [ParcelStatusEnum.pending]: "En attente",
  [ParcelStatusEnum.inTransit]: "En cours",
  [ParcelStatusEnum.delivered]: "Livré",
};

export const TRANSPORTER_STATUS_LABELS: Record<TransporterStatusEnum, string> =
  {
    [TransporterStatusEnum.pending]: "En attente",
    [TransporterStatusEnum.validated]: "Validé",
    [TransporterStatusEnum.rejected]: "Rejeté",
  };

// Tailwind class helpers for status badges.
export const PARCEL_STATUS_BADGE_CLASS: Record<ParcelStatusEnum, string> = {
  [ParcelStatusEnum.pending]: "status-pending",
  [ParcelStatusEnum.inTransit]: "status-in-transit",
  [ParcelStatusEnum.delivered]: "status-delivered",
};
