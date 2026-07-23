import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import ParcelLib "../lib/parcels";
import Users "../lib/users";
import UsersTypes "../types/users";
import Types "../types/parcels";

mixin (
  accessControlState : AccessControl.AccessControlState,
  transporters : Map.Map<Principal, UsersTypes.TransporterProfile>,
  parcels : ParcelLib.Parcels,
  nextId : ParcelLib.NextId,
) {
  /// A validated transporter registers a new parcel. The caller must be a
  /// validated transporter; the parcel is owned by the caller. Validates
  /// that trackingCode is non-empty (after auto-generation from senderName).
  public shared ({ caller }) func registerParcel(input : Types.ParcelInput) : async Types.ParcelId {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: anonymous caller");
    };
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      if (not Users.isTransporterValidated(transporters, caller)) {
        Runtime.trap("Unauthorized: transporter not validated");
      };
    };
    parcels.createParcel(nextId, caller, input, Time.now());
  };

  /// A transporter fetches one of their own parcels by id. Ownership is
  /// enforced: a caller may only retrieve a parcel they own.
  public query ({ caller }) func getMyParcel(id : Types.ParcelId) : async ?Types.Parcel {
    switch (parcels.getParcel(id)) {
      case null null;
      case (?p) {
        if (p.owner != caller) {
          Runtime.trap("Unauthorized: not the owner");
        };
        ?p;
      };
    };
  };

  /// A transporter lists all of their own parcels (confidentiality: only own).
  public query ({ caller }) func listMyParcels() : async [Types.Parcel] {
    parcels.listParcelsByOwner(caller);
  };

  /// Admin lists every parcel across all transporters.
  public query ({ caller }) func listAllParcels() : async [Types.Parcel] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    parcels.listAllParcels();
  };

  /// Admin searches across all parcels with a filter.
  public query ({ caller }) func searchParcels(filter : Types.ParcelFilter) : async [Types.Parcel] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    parcels.searchParcels(filter);
  };

  /// A transporter updates one of their own parcels. Transporters may edit
  /// parcel fields including status and trackingCode.
  public shared ({ caller }) func updateMyParcel(id : Types.ParcelId, update : Types.ParcelUpdate) : async ?Types.Parcel {
    switch (parcels.getParcel(id)) {
      case null null;
      case (?p) {
        if (p.owner != caller) {
          Runtime.trap("Unauthorized: not the owner");
        };
        parcels.updateParcel(id, update, Time.now());
      };
    };
  };

  /// Admin updates any parcel regardless of owner.
  public shared ({ caller }) func updateAnyParcel(id : Types.ParcelId, update : Types.ParcelUpdate) : async ?Types.Parcel {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    parcels.updateParcel(id, update, Time.now());
  };

  /// A transporter deletes one of their own parcels.
  public shared ({ caller }) func deleteMyParcel(id : Types.ParcelId) : async ?Types.Parcel {
    switch (parcels.getParcel(id)) {
      case null null;
      case (?p) {
        if (p.owner != caller) {
          Runtime.trap("Unauthorized: not the owner");
        };
        parcels.deleteParcel(id);
      };
    };
  };

  /// Admin deletes any parcel regardless of owner.
  public shared ({ caller }) func deleteAnyParcel(id : Types.ParcelId) : async ?Types.Parcel {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    parcels.deleteParcel(id);
  };

  /// Admin retrieves aggregated dashboard statistics: total parcels,
  /// counts by status, and top transporters by parcel volume.
  public query ({ caller }) func getDashboardStats() : async Types.DashboardStats {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    parcels.getDashboardStats();
  };
};
