module {
  /// A single useful link displayed on the public news page.
  public type NewsLink = {
    id : Nat;
    linkLabel : Text;
    url : Text;
  };

  /// The public news page content for DM Transport.
  public type NewsPage = {
    title : Text;
    description : Text;
    whatsappLink : Text;
    links : [NewsLink];
  };

  /// Payload for creating a new useful link (admin only).
  public type NewsLinkInput = {
    linkLabel : Text;
    url : Text;
  };

  /// Payload for updating the news page fields (admin only).
  public type NewsPageInput = {
    title : Text;
    description : Text;
    whatsappLink : Text;
  };
};
