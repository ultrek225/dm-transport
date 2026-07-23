import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/users";
import Users "../lib/users";

mixin (
  accessControlState : AccessControl.AccessControlState,
  transporters : Map.Map<Principal, Types.TransporterProfile>,
) {
  /// Self-registration for a transporter via Internet Identity. The caller
  /// must be authenticated (non-anonymous). Creates a #pending profile if the
  /// caller is not already registered, otherwise returns the existing one.
  public shared ({ caller }) func registerAsTransporter() : async Types.TransporterProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: anonymous caller");
    };
    Users.registerTransporter(transporters, caller, Time.now());
  };

  /// A transporter fetches their own profile.
  public query ({ caller }) func getMyTransporterProfile() : async ?Types.TransporterProfile {
    Users.getTransporter(transporters, caller);
  };

  /// Admin fetches any transporter's profile by principal.
  public query ({ caller }) func getTransporterProfile(
    principal : Principal,
  ) : async ?Types.TransporterProfile {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    Users.getTransporter(transporters, principal);
  };

  /// Admin lists all registered transporters.
  public query ({ caller }) func listTransporters() : async [Types.TransporterProfile] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    Users.listTransporters(transporters);
  };

  /// Admin lists transporters filtered by status (e.g. all #pending).
  public query ({ caller }) func listTransportersByStatus(
    status : Types.TransporterStatus,
  ) : async [Types.TransporterProfile] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    Users.listByStatus(transporters, status);
  };

  /// A transporter checks whether their own profile is validated.
  public query ({ caller }) func isCallerTransporterValidated() : async Bool {
    Users.isTransporterValidated(transporters, caller);
  };

  /// Admin validates a transporter's profile.
  public shared ({ caller }) func validateTransporter(
    principal : Principal,
  ) : async ?Types.TransporterProfile {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    Users.validateTransporter(transporters, principal, Time.now());
  };

  /// Admin rejects a transporter's profile.
  public shared ({ caller }) func rejectTransporter(
    principal : Principal,
  ) : async ?Types.TransporterProfile {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    Users.rejectTransporter(transporters, principal, Time.now());
  };

  /// Admin reverts a transporter back to #pending.
  public shared ({ caller }) func revokeTransporter(
    principal : Principal,
  ) : async ?Types.TransporterProfile {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    Users.revokeTransporter(transporters, principal, Time.now());
  };
};
