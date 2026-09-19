import Common "common";

module {
  public type ProductId = Common.ProductId;
  public type Timestamp = Common.Timestamp;
  public type Satang = Common.Satang;

  /// A product offered by the shop.
  public type Product = {
    id : ProductId;
    name : Text;
    sku : Text;
    unit : Text;
    unitPrice : Satang;
    category : Text;
    active : Bool;
    createdAt : Timestamp;
  };

  /// Input for creating a product.
  public type ProductInput = {
    name : Text;
    sku : Text;
    unit : Text;
    unitPrice : Satang;
    category : Text;
  };

  /// Input for editing an existing product.
  public type ProductUpdate = {
    name : Text;
    sku : Text;
    unit : Text;
    unitPrice : Satang;
    category : Text;
    active : Bool;
  };

  /// Search and filter options for the product list.
  public type ProductQuery = {
    search : ?Text;
    category : ?Text;
    activeOnly : ?Bool;
  };
};
