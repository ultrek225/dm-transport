import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/news";
import NewsLib "../lib/news";

mixin (accessControlState : AccessControl.AccessControlState, state : NewsLib.NewsState) {
  /// Public query: return the news page content (no login required).
  public query func getNewsPage() : async Types.NewsPage {
    NewsLib.getPage(state);
  };

  /// Admin only: update the title, description and WhatsApp link.
  public shared ({ caller }) func updateNewsPage(input : Types.NewsPageInput) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    NewsLib.updatePage(state, input);
  };

  /// Admin only: add a new useful link.
  public shared ({ caller }) func addNewsLink(input : Types.NewsLinkInput) : async Types.NewsLink {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    NewsLib.addLink(state, input);
  };

  /// Admin only: update an existing useful link by id.
  public shared ({ caller }) func updateNewsLink(id : Nat, input : Types.NewsLinkInput) : async ?Types.NewsLink {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    NewsLib.updateLink(state, id, input);
  };

  /// Admin only: delete a useful link by id.
  public shared ({ caller }) func deleteNewsLink(id : Nat) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    NewsLib.deleteLink(state, id);
  };
};
