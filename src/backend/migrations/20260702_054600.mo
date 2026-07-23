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

  type Parcel = {
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

  type OldActor = {};

  type NewActor = {
    var accessControlState : AccessControlState;
    var transporters : Map.Map<Principal, TransporterProfile>;
    var parcels : List.List<Parcel>;
    var parcelNextId : NextId;
    var newsState : NewsState;
  };

  public func migration(old : OldActor) : NewActor {
    {
      var accessControlState = {
        var adminAssigned = false;
        userRoles = Map.empty();
      };
      var transporters = Map.empty();
      var parcels = List.empty();
      var parcelNextId = { var next = 0 };
      var newsState = {
        var title = "";
        var description = "";
        var whatsappLink = "";
        var links = List.empty();
        var nextLinkId = 0;
      };
    };
  };
};
