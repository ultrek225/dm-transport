module {
  public type ParcelId = Nat;

  public type ParcelStatus = {
    #pending;
    #inTransit;
    #delivered;
  };

  public type Parcel = {
    id : ParcelId;
    owner : Principal;
    senderName : Text;
    trackingCode : Text;
    clientName : Text;
    parcelCount : Nat;
    parcelType : Text;
    destinationAddress : Text;
    clientPhone : Text;
    additionalInfo : Text;
    status : ParcelStatus;
    createdAt : Int;
    updatedAt : Int;
  };

  public type ParcelInput = {
    senderName : Text;
    trackingCode : Text;
    clientName : Text;
    parcelCount : Nat;
    parcelType : Text;
    destinationAddress : Text;
    clientPhone : Text;
    additionalInfo : Text;
  };

  public type ParcelUpdate = {
    senderName : ?Text;
    trackingCode : ?Text;
    clientName : ?Text;
    parcelCount : ?Nat;
    parcelType : ?Text;
    destinationAddress : ?Text;
    clientPhone : ?Text;
    additionalInfo : ?Text;
    status : ?ParcelStatus;
  };

  public type ParcelFilter = {
    status : ?ParcelStatus;
    fromDate : ?Int;
    toDate : ?Int;
    clientNameQuery : ?Text;
  };

  /// Statistiques agrégées pour le tableau de bord administrateur.
  public type DashboardStats = {
    totalParcels : Nat;
    pendingCount : Nat;
    inTransitCount : Nat;
    deliveredCount : Nat;
    byTransporteur : [(Principal, Nat)];
  };
};
