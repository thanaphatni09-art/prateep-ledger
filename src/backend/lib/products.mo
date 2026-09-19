import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Common "../types/common";
import Products "../types/products";

module {
  /// List products matching the query.
  public func listProducts(
    products : Map.Map<Common.ProductId, Products.Product>,
    filter : Products.ProductQuery,
  ) : [Products.Product] {
    let term = switch (filter.search) {
      case (?s) { ?s.toLower() };
      case null { null };
    };
    let category = filter.category;
    let activeOnly = filter.activeOnly ?? false;

    let rows = List.empty<Products.Product>();
    for (product in products.values()) {
      let matchesSearch = switch (term) {
        case (?t) {
          product.name.toLower().contains(#text t) or product.sku.toLower().contains(#text t);
        };
        case null { true };
      };
      let matchesCategory = switch (category) {
        case (?c) { product.category == c };
        case null { true };
      };
      let matchesActive = (not activeOnly) or product.active;
      if (matchesSearch and matchesCategory and matchesActive) {
        rows.add(product);
      };
    };
    rows.toArray().sort(func(a, b) = a.name.compare(b.name));
  };

  /// Fetch a single product.
  public func getProduct(
    products : Map.Map<Common.ProductId, Products.Product>,
    id : Common.ProductId,
  ) : ?Products.Product {
    products.get(id);
  };

  /// Create a product.
  public func createProduct(
    products : Map.Map<Common.ProductId, Products.Product>,
    counters : { var nextProductId : Nat },
    input : Products.ProductInput,
  ) : Products.Product {
    let id = counters.nextProductId;
    counters.nextProductId := id + 1;
    let product : Products.Product = {
      id;
      name = input.name;
      sku = input.sku;
      unit = input.unit;
      unitPrice = input.unitPrice;
      category = input.category;
      active = true;
      createdAt = Time.now();
    };
    products.add(id, product);
    product;
  };

  /// Edit an existing product.
  public func updateProduct(
    products : Map.Map<Common.ProductId, Products.Product>,
    id : Common.ProductId,
    input : Products.ProductUpdate,
  ) : ?Products.Product {
    switch (products.get(id)) {
      case null { null };
      case (?existing) {
        let updated : Products.Product = {
          id = existing.id;
          name = input.name;
          sku = input.sku;
          unit = input.unit;
          unitPrice = input.unitPrice;
          category = input.category;
          active = input.active;
          createdAt = existing.createdAt;
        };
        products.add(id, updated);
        ?updated;
      };
    };
  };

  /// Deactivate a product without deleting its invoice history.
  public func deactivateProduct(
    products : Map.Map<Common.ProductId, Products.Product>,
    id : Common.ProductId,
  ) : ?Products.Product {
    switch (products.get(id)) {
      case null { null };
      case (?existing) {
        let updated : Products.Product = {
          id = existing.id;
          name = existing.name;
          sku = existing.sku;
          unit = existing.unit;
          unitPrice = existing.unitPrice;
          category = existing.category;
          active = false;
          createdAt = existing.createdAt;
        };
        products.add(id, updated);
        ?updated;
      };
    };
  };
};
