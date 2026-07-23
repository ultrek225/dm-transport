import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface ParcelFilter {
    status?: ParcelStatus;
    toDate?: bigint;
    fromDate?: bigint;
    clientNameQuery?: string;
}
export interface NewsLink {
    id: bigint;
    url: string;
    linkLabel: string;
}
export interface NewsPageInput {
    title: string;
    whatsappLink: string;
    description: string;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type ParcelId = bigint;
export interface ParcelInput {
    additionalInfo: string;
    trackingCode: string;
    clientName: string;
    destinationAddress: string;
    parcelType: string;
    clientPhone: string;
    senderName: string;
    parcelCount: bigint;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface DashboardStats {
    pendingCount: bigint;
    byTransporteur: Array<[Principal, bigint]>;
    inTransitCount: bigint;
    totalParcels: bigint;
    deliveredCount: bigint;
}
export interface TransporterProfile {
    status: TransporterStatus;
    principal: Principal;
    rejectedAt?: Timestamp;
    validatedAt?: Timestamp;
    registeredAt: Timestamp;
}
export interface ParcelUpdate {
    status?: ParcelStatus;
    additionalInfo?: string;
    trackingCode?: string;
    clientName?: string;
    destinationAddress?: string;
    parcelType?: string;
    clientPhone?: string;
    senderName?: string;
    parcelCount?: bigint;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export interface Cell {
    value: Value;
    name: string;
}
export interface NewsPage {
    title: string;
    whatsappLink: string;
    description: string;
    links: Array<NewsLink>;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export interface Parcel {
    id: ParcelId;
    status: ParcelStatus;
    additionalInfo: string;
    trackingCode: string;
    clientName: string;
    owner: Principal;
    destinationAddress: string;
    createdAt: bigint;
    parcelType: string;
    updatedAt: bigint;
    clientPhone: string;
    senderName: string;
    parcelCount: bigint;
}
export interface NewsLinkInput {
    url: string;
    linkLabel: string;
}
export enum ParcelStatus {
    pending = "pending",
    inTransit = "inTransit",
    delivered = "delivered"
}
export enum TransporterStatus {
    pending = "pending",
    validated = "validated",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addNewsLink(input: NewsLinkInput): Promise<NewsLink>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteAnyParcel(id: ParcelId): Promise<Parcel | null>;
    deleteMyParcel(id: ParcelId): Promise<Parcel | null>;
    deleteNewsLink(id: bigint): Promise<boolean>;
    execute(qJson: string): Promise<Result>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getMyParcel(id: ParcelId): Promise<Parcel | null>;
    getMyTransporterProfile(): Promise<TransporterProfile | null>;
    getNewsPage(): Promise<NewsPage>;
    getTransporterProfile(principal: Principal): Promise<TransporterProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerTransporterValidated(): Promise<boolean>;
    listAllParcels(): Promise<Array<Parcel>>;
    listMyParcels(): Promise<Array<Parcel>>;
    listTransporters(): Promise<Array<TransporterProfile>>;
    listTransportersByStatus(status: TransporterStatus): Promise<Array<TransporterProfile>>;
    registerAsTransporter(): Promise<TransporterProfile>;
    registerParcel(input: ParcelInput): Promise<ParcelId>;
    rejectTransporter(principal: Principal): Promise<TransporterProfile | null>;
    revokeTransporter(principal: Principal): Promise<TransporterProfile | null>;
    schema(): Promise<string>;
    searchParcels(filter: ParcelFilter): Promise<Array<Parcel>>;
    updateAnyParcel(id: ParcelId, update: ParcelUpdate): Promise<Parcel | null>;
    updateMyParcel(id: ParcelId, update: ParcelUpdate): Promise<Parcel | null>;
    updateNewsLink(id: bigint, input: NewsLinkInput): Promise<NewsLink | null>;
    updateNewsPage(input: NewsPageInput): Promise<void>;
    validateTransporter(principal: Principal): Promise<TransporterProfile | null>;
}
