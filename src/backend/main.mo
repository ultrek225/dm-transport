import Map "mo:core/Map";
import List "mo:core/List";
import MixinViews "mo:caffeineai-data-viewer/MixinViews";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import OQL "mo:caffeineai-oql";
import Expose "mo:caffeineai-oql/Expose";
import UsersTypes "types/users";
import ParcelsTypes "types/parcels";
import NewsTypes "types/news";
import ParcelLib "lib/parcels";
import NewsLib "lib/news";
import MixinUsers "mixins/users-api";
import MixinParcels "mixins/parcels-api";
import MixinNews "mixins/news-api";

actor {
  include MixinViews();

   var accessControlState : AccessControl.AccessControlState;
   var transporters : Map.Map<Principal, UsersTypes.TransporterProfile>;
   var parcels : ParcelLib.Parcels;
   var parcelNextId : ParcelLib.NextId;
   var newsState : NewsLib.NewsState;

  include MixinAuthorization(accessControlState, null);
  include MixinUsers(accessControlState, transporters);
  include MixinParcels(accessControlState, transporters, parcels, parcelNextId);
  include MixinNews(accessControlState, newsState);

  // OQL — expose the parcels collection for natural-language queries by the
  // Data Intelligence agent. Controller-only: private app data the agent
  // answers over, no end user reads it directly.
  include Expose({
    entities = [
      parcels.toEntityManual("parcel", "Parcel", "id")
        .payload("id", func(p : ParcelsTypes.Parcel) : Nat { p.id })
        .payload("owner", func(p : ParcelsTypes.Parcel) : Principal { p.owner })
        .payload("senderName", func(p : ParcelsTypes.Parcel) : Text { p.senderName })
        .payload("trackingCode", func(p : ParcelsTypes.Parcel) : Text { p.trackingCode })
        .payload("clientName", func(p : ParcelsTypes.Parcel) : Text { p.clientName })
        .payload("parcelCount", func(p : ParcelsTypes.Parcel) : Nat { p.parcelCount })
        .payload("parcelType", func(p : ParcelsTypes.Parcel) : Text { p.parcelType })
        .payload("destinationAddress", func(p : ParcelsTypes.Parcel) : Text { p.destinationAddress })
        .payload("clientPhone", func(p : ParcelsTypes.Parcel) : Text { p.clientPhone })
        .payload("additionalInfo", func(p : ParcelsTypes.Parcel) : Text { p.additionalInfo })
        .payload("status", func(p : ParcelsTypes.Parcel) : Text {
          switch (p.status) {
            case (#pending) "pending";
            case (#inTransit) "inTransit";
            case (#delivered) "delivered";
          };
        })
        .payload("createdAt", func(p : ParcelsTypes.Parcel) : Int { p.createdAt })
        .payload("updatedAt", func(p : ParcelsTypes.Parcel) : Int { p.updatedAt })
        .controllerOnly()
        .build(),
    ];
  });
};
