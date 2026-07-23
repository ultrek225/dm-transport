import Map "mo:core/Map";
import List "mo:core/List";

module {
  type UserRole = {
    #admin;
    #user;
    #guest;
  };

  type TransporterStatus = {
    #pending;
    #validated;
    #rejected;
  };

  type TransporterProfile = {
    principal : Principal;
    status : TransporterStatus;
    registeredAt : Int;
    validatedAt : ?Int;
    rejectedAt : ?Int;
  };

  type ParcelStatus = {
    #pending;
    #inTransit;
    #delivered;
  };

  // Previous Parcel shape (before this migration): no senderName / trackingCode.
  type OldParcel = {
    id : Nat;
    owner : Principal;
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

  // New Parcel shape: adds senderName and trackingCode.
  type NewParcel = {
    id : Nat;
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

  type NewsLink = {
    id : Nat;
    linkLabel : Text;
    url : Text;
  };

  type AccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };

  type NextId = {
    var next : Nat;
  };

  type NewsState = {
    var title : Text;
    var description : Text;
    var whatsappLink : Text;
    var links : List.List<NewsLink>;
    var nextLinkId : Nat;
  };

  // OldActor matches the NewActor of the previous migration (20260702_054600).
  type OldActor = {
    var accessControlState : AccessControlState;
    var transporters : Map.Map<Principal, TransporterProfile>;
    var parcels : List.List<OldParcel>;
    var parcelNextId : NextId;
    var newsState : NewsState;
  };

  type NewActor = {
    var accessControlState : AccessControlState;
    var transporters : Map.Map<Principal, TransporterProfile>;
    var parcels : List.List<NewParcel>;
    var parcelNextId : NextId;
    var newsState : NewsState;
  };

  public func migration(old : OldActor) : NewActor {
    // Backfill senderName and trackingCode on existing parcels.
    let newParcels = old.parcels.map<OldParcel, NewParcel>(
      func(p : OldParcel) : NewParcel {
        {
          id = p.id;
          owner = p.owner;
          senderName = "";
          trackingCode = "";
          clientName = p.clientName;
          parcelCount = p.parcelCount;
          parcelType = p.parcelType;
          destinationAddress = p.destinationAddress;
          clientPhone = p.clientPhone;
          additionalInfo = p.additionalInfo;
          status = p.status;
          createdAt = p.createdAt;
          updatedAt = p.updatedAt;
        };
      },
    );
    {
      var accessControlState = old.accessControlState;
      var transporters = old.transporters;
      var parcels = newParcels;
      var parcelNextId = old.parcelNextId;
      var newsState = old.newsState;
    };
  };
};
