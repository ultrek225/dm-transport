import Common "common";

module {
  public type Timestamp = Common.Timestamp;

  public type TransporterStatus = {
    #pending;
    #validated;
    #rejected;
  };

  public type TransporterProfile = {
    principal : Principal;
    status : TransporterStatus;
    registeredAt : Timestamp;
    validatedAt : ?Timestamp;
    rejectedAt : ?Timestamp;
  };
};
