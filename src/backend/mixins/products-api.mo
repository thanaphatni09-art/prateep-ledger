import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import Products "../types/products";
import ProductsLib "../lib/products";

mixin (
  accessControlState : AccessControl.AccessControlState,
  products : Map.Map<Common.ProductId, Products.Product>,
  counters : { var nextProductId : Nat },
) {
  func requireManagerProducts(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the manager can perform this action");
    };
  };

  /// List products with search and category filter applied.
  public query ({ caller }) func listProducts(
    filter : Products.ProductQuery,
  ) : async [Products.Product] {
    requireManagerProducts(caller);
    ProductsLib.listProducts(products, filter);
  };

  /// Fetch a single product.
  public query ({ caller }) func getProduct(
    id : Common.ProductId,
  ) : async ?Products.Product {
    requireManagerProducts(caller);
    ProductsLib.getProduct(products, id);
  };

  /// Create a product.
  public shared ({ caller }) func createProduct(
    input : Products.ProductInput,
  ) : async Products.Product {
    requireManagerProducts(caller);
    ProductsLib.createProduct(products, counters, input);
  };

  /// Edit an existing product.
  public shared ({ caller }) func updateProduct(
    id : Common.ProductId,
    input : Products.ProductUpdate,
  ) : async ?Products.Product {
    requireManagerProducts(caller);
    ProductsLib.updateProduct(products, id, input);
  };

  /// Deactivate a product without deleting its invoice history.
  public shared ({ caller }) func deactivateProduct(
    id : Common.ProductId,
  ) : async ?Products.Product {
    requireManagerProducts(caller);
    ProductsLib.deactivateProduct(products, id);
  };
};
