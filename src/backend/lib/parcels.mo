import Array "mo:core/Array";
import Char "mo:core/Char";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Types "../types/parcels";

module {
  public type Parcel = Types.Parcel;
  public type ParcelId = Types.ParcelId;
  public type ParcelInput = Types.ParcelInput;
  public type ParcelUpdate = Types.ParcelUpdate;
  public type ParcelFilter = Types.ParcelFilter;
  public type DashboardStats = Types.DashboardStats;
  public type Parcels = List.List<Parcel>;
  public type NextId = { var next : Nat };

  /// Normalize a sender name into a 3-4 uppercase letter prefix: strip
  /// accents/diacritics and non-alphabetic characters, uppercase the result,
  /// then take the first 4 letters (or pad with 'X' if shorter).
  func senderPrefix(senderName : Text) : Text {
    // Uppercase the whole name, keep only alphabetic chars, then pad/truncate
    // to exactly 4 characters using 'X' as the padding letter.
    let upper = senderName.map(func(c : Char) : Char {
      Char.fromNat32(c.toNat32() - 32);
    });
    let letters = upper.toArray().filter(func(c : Char) : Bool {
      c.isAlphabetic();
    });
    let n = letters.size();
    let arr : [Char] = if (n >= 4) {
      [letters[0], letters[1], letters[2], letters[3]];
    } else if (n == 3) {
      [letters[0], letters[1], letters[2], 'X'];
    } else if (n == 2) {
      [letters[0], letters[1], 'X', 'X'];
    } else if (n == 1) {
      [letters[0], 'X', 'X', 'X'];
    } else {
      ['X', 'X', 'X', 'X'];
    };
    Text.fromIter(arr.vals());
  };

  /// Generate a tracking code from the sender name when the input provides an
  /// empty one. The code combines a normalized 4-letter prefix with a short
  /// counter-based suffix to guarantee uniqueness within the canister.
  public func generateTrackingCode(
    self : Parcels,
    nextId : NextId,
    senderName : Text,
  ) : Text {
    let prefix = senderPrefix(senderName);
    let suffix = nextId.next.toText();
    prefix # "-" # suffix;
  };

  /// Create a new parcel owned by `owner`. The parcel starts with status
  /// #pending. Generates a trackingCode from senderName when the input
  /// trackingCode is empty. Validates that the trackingCode is non-empty
  /// after generation.
  public func createParcel(
    self : Parcels,
    nextId : NextId,
    owner : Principal,
    input : ParcelInput,
    now : Int,
  ) : ParcelId {
    let trackingCode = if (input.trackingCode == "") {
      generateTrackingCode(self, nextId, input.senderName);
    } else {
      input.trackingCode;
    };
    if (trackingCode == "") {
      Runtime.trap("trackingCode must not be empty");
    };
    let id = nextId.next;
    nextId.next := nextId.next + 1;
    let parcel : Parcel = {
      id;
      owner;
      senderName = input.senderName;
      trackingCode;
      clientName = input.clientName;
      parcelCount = input.parcelCount;
      parcelType = input.parcelType;
      destinationAddress = input.destinationAddress;
      clientPhone = input.clientPhone;
      additionalInfo = input.additionalInfo;
      status = #pending;
      createdAt = now;
      updatedAt = now;
    };
    self.add(parcel);
    id;
  };

  public func getParcel(self : Parcels, id : ParcelId) : ?Parcel {
    self.find(func(p : Parcel) : Bool { p.id == id });
  };

  /// Parcels belonging to a given owner (transporter), in insertion order.
  public func listParcelsByOwner(self : Parcels, owner : Principal) : [Parcel] {
    self.filter(func(p : Parcel) : Bool { p.owner == owner }).toArray();
  };

  public func listAllParcels(self : Parcels) : [Parcel] {
    self.values().toArray();
  };

  /// Admin-only search across all parcels. Applies every provided filter
  /// criterion; absent criteria are ignored.
  public func searchParcels(self : Parcels, filter : ParcelFilter) : [Parcel] {
    self.filter(func(p : Parcel) : Bool {
      let statusOk = switch (filter.status) {
        case null true;
        case (?s) p.status == s;
      };
      let fromOk = switch (filter.fromDate) {
        case null true;
        case (?from) p.createdAt >= from;
      };
      let toOk = switch (filter.toDate) {
        case null true;
        case (?to) p.createdAt <= to;
      };
      let clientOk = switch (filter.clientNameQuery) {
        case null true;
        case (?q) {
          let lowered = p.clientName.toLower();
          lowered.contains(#text(q.toLower()));
        };
      };
      statusOk and fromOk and toOk and clientOk;
    }).toArray();
  };

  /// Apply a partial update to the parcel identified by `id`. Returns the
  /// updated parcel, or null if no parcel with that id exists.
  public func updateParcel(
    self : Parcels,
    id : ParcelId,
    update : ParcelUpdate,
    now : Int,
  ) : ?Parcel {
    let index = self.findIndex(func(p : Parcel) : Bool { p.id == id });
    switch (index) {
      case null null;
      case (?i) {
        let current = self.at(i);
        let updated : Parcel = {
          id = current.id;
          owner = current.owner;
          senderName = switch (update.senderName) {
            case null current.senderName;
            case (?v) v;
          };
          trackingCode = switch (update.trackingCode) {
            case null current.trackingCode;
            case (?v) v;
          };
          clientName = switch (update.clientName) {
            case null current.clientName;
            case (?v) v;
          };
          parcelCount = switch (update.parcelCount) {
            case null current.parcelCount;
            case (?v) v;
          };
          parcelType = switch (update.parcelType) {
            case null current.parcelType;
            case (?v) v;
          };
          destinationAddress = switch (update.destinationAddress) {
            case null current.destinationAddress;
            case (?v) v;
          };
          clientPhone = switch (update.clientPhone) {
            case null current.clientPhone;
            case (?v) v;
          };
          additionalInfo = switch (update.additionalInfo) {
            case null current.additionalInfo;
            case (?v) v;
          };
          status = switch (update.status) {
            case null current.status;
            case (?v) v;
          };
          createdAt = current.createdAt;
          updatedAt = now;
        };
        self.put(i, updated);
        ?updated;
      };
    };
  };

  /// Remove the parcel with the given id. Returns the removed parcel, or
  /// null if it did not exist.
  public func deleteParcel(self : Parcels, id : ParcelId) : ?Parcel {
    let index = self.findIndex(func(p : Parcel) : Bool { p.id == id });
    switch (index) {
      case null null;
      case (?i) {
        let removed = self.at(i);
        let lastIndex = self.size() - 1;
        if (i == lastIndex) {
          ignore self.removeLast();
        } else {
          let last = self.at(lastIndex);
          self.put(i, last);
          ignore self.removeLast();
        };
        ?removed;
      };
    };
  };

  /// Compute aggregated dashboard statistics across all parcels:
  /// total, counts by status, and top transporters by parcel volume.
  public func getDashboardStats(self : Parcels) : DashboardStats {
    var totalParcels = 0;
    var pendingCount = 0;
    var inTransitCount = 0;
    var deliveredCount = 0;
    let counts = Map.empty<Principal, Nat>();
    for (p in self.values()) {
      totalParcels += 1;
      switch (p.status) {
        case (#pending) pendingCount += 1;
        case (#inTransit) inTransitCount += 1;
        case (#delivered) deliveredCount += 1;
      };
      let current = switch (counts.get(p.owner)) {
        case null 0;
        case (?n) n;
      };
      counts.add(p.owner, current + 1);
    };
    let byTransporteur = counts.entries()
      .map<(Principal, Nat), (Principal, Nat)>(
        func(entry : (Principal, Nat)) : (Principal, Nat) { entry },
      )
      .toArray();
    let sorted = byTransporteur.sort(
      func(a : (Principal, Nat), b : (Principal, Nat)) : Order.Order {
        Nat.compare(b.1, a.1);
      },
    );
    {
      totalParcels;
      pendingCount;
      inTransitCount;
      deliveredCount;
      byTransporteur = sorted;
    };
  };
};
