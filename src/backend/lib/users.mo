import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Types "../types/users";

module {
  public type TransporterStatus = Types.TransporterStatus;
  public type TransporterProfile = Types.TransporterProfile;

  /// Register a new transporter if not already present. Returns the existing
  /// or newly created profile. New profiles start with status #pending.
  public func registerTransporter(
    transporters : Map.Map<Principal, TransporterProfile>,
    principal : Principal,
    now : Types.Timestamp,
  ) : TransporterProfile {
    switch (transporters.get(principal)) {
      case (?existing) { existing };
      case (null) {
        let profile : TransporterProfile = {
          principal;
          status = #pending;
          registeredAt = now;
          validatedAt = null;
          rejectedAt = null;
        };
        transporters.add(principal, profile);
        profile;
      };
    };
  };

  public func getTransporter(
    transporters : Map.Map<Principal, TransporterProfile>,
    principal : Principal,
  ) : ?TransporterProfile {
    transporters.get(principal);
  };

  public func listTransporters(
    transporters : Map.Map<Principal, TransporterProfile>,
  ) : [TransporterProfile] {
    transporters.values().toArray();
  };

  public func listByStatus(
    transporters : Map.Map<Principal, TransporterProfile>,
    status : TransporterStatus,
  ) : [TransporterProfile] {
    Iter.toArray(
      transporters.values().filter(
        func(p : TransporterProfile) : Bool { p.status == status },
      )
    );
  };

  /// Admin sets the transporter status to #validated and records validatedAt.
  public func validateTransporter(
    transporters : Map.Map<Principal, TransporterProfile>,
    principal : Principal,
    now : Types.Timestamp,
  ) : ?TransporterProfile {
    switch (transporters.get(principal)) {
      case (?profile) {
        let updated : TransporterProfile = {
          profile with
          status = #validated;
          validatedAt = ?now;
        };
        transporters.add(principal, updated);
        ?updated;
      };
      case (null) { null };
    };
  };

  /// Admin sets the transporter status to #rejected and records rejectedAt.
  public func rejectTransporter(
    transporters : Map.Map<Principal, TransporterProfile>,
    principal : Principal,
    now : Types.Timestamp,
  ) : ?TransporterProfile {
    switch (transporters.get(principal)) {
      case (?profile) {
        let updated : TransporterProfile = {
          profile with
          status = #rejected;
          rejectedAt = ?now;
        };
        transporters.add(principal, updated);
        ?updated;
      };
      case (null) { null };
    };
  };

  /// Admin reverts a validated transporter back to #pending.
  public func revokeTransporter(
    transporters : Map.Map<Principal, TransporterProfile>,
    principal : Principal,
    now : Types.Timestamp,
  ) : ?TransporterProfile {
    switch (transporters.get(principal)) {
      case (?profile) {
        let updated : TransporterProfile = {
          profile with
          status = #pending;
          validatedAt = null;
        };
        transporters.add(principal, updated);
        ?updated;
      };
      case (null) { null };
    };
  };

  public func isTransporterValidated(
    transporters : Map.Map<Principal, TransporterProfile>,
    principal : Principal,
  ) : Bool {
    switch (transporters.get(principal)) {
      case (?profile) { profile.status == #validated };
      case (null) { false };
    };
  };
};
