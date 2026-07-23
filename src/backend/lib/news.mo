import List "mo:core/List";
import Iter "mo:core/Iter";
import Types "../types/news";

module {
  public type NewsState = {
    var title : Text;
    var description : Text;
    var whatsappLink : Text;
    var links : List.List<Types.NewsLink>;
    var nextLinkId : Nat;
  };

  /// Initialize a fresh news state with default empty content.
  public func newState() : NewsState {
    {
      var title = "";
      var description = "";
      var whatsappLink = "";
      var links = List.empty();
      var nextLinkId = 0;
    };
  };

  /// Return the current news page as a shared (immutable) value.
  public func getPage(state : NewsState) : Types.NewsPage {
    {
      title = state.title;
      description = state.description;
      whatsappLink = state.whatsappLink;
      links = state.links.values().toArray();
    };
  };

  /// Replace the editable text fields of the news page (admin only).
  public func updatePage(state : NewsState, input : Types.NewsPageInput) : () {
    state.title := input.title;
    state.description := input.description;
    state.whatsappLink := input.whatsappLink;
  };

  /// Append a new useful link and return it (admin only).
  public func addLink(state : NewsState, input : Types.NewsLinkInput) : Types.NewsLink {
    let id = state.nextLinkId;
    state.nextLinkId := state.nextLinkId + 1;
    let link : Types.NewsLink = {
      id;
      linkLabel = input.linkLabel;
      url = input.url;
    };
    state.links.add(link);
    link;
  };

  /// Update an existing useful link by id (admin only).
  public func updateLink(state : NewsState, id : Nat, input : Types.NewsLinkInput) : ?Types.NewsLink {
    switch (state.links.findIndex(func(l : Types.NewsLink) : Bool { l.id == id })) {
      case null { null };
      case (?index) {
        let updated : Types.NewsLink = {
          id;
          linkLabel = input.linkLabel;
          url = input.url;
        };
        state.links.put(index, updated);
        ?updated;
      };
    };
  };

  /// Remove a useful link by id (admin only). Returns true if a link was removed.
  public func deleteLink(state : NewsState, id : Nat) : Bool {
    switch (state.links.findIndex(func(l : Types.NewsLink) : Bool { l.id == id })) {
      case null { false };
      case (?index) {
        let lastIndex = state.links.size() - 1;
        if (index == lastIndex) {
          ignore state.links.removeLast();
        } else {
          let last = state.links.at(lastIndex);
          state.links.put(index, last);
          ignore state.links.removeLast();
        };
        true;
      };
    };
  };
};
