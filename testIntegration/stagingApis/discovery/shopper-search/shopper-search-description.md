# API Overview

The Shopper Search API enables you to implement search functionality that lets shoppers search for products using keywords and refinement. The search results can be products or suggestions based on the endpoint you choose in the API.

Caching is provided for the Shopper Search API. For details, see [Server-Side Web-Tier Caching.](https://developer.salesforce.com/docs/commerce/commerce-api/guide/server-side-web-tier-caching.html)

## Authentication & Authorization

The client requesting the API must have access to the product search and search suggestion resource.
The Shopper Search API requires a JWT acquired via the Shopper Customers endpoint:

```
https://{shortCode}.api.commercecloud.salesforce.com/customer/shopper-customers/v1/organizations/{organizationId}/customers/actions/login
```
## Use Cases

### Provide Search Suggestions

Use the Shopper Search API to provide search suggestions as a shopper searches.

For example, a developer who is building a shopping app using the Salesforce Commerce API would like to provide product, brand, and category suggestions. When a shopper types in a search phrase that exceeds a definable minimum length and the GET Search Suggestion endpoint is requested, the platform delivers a set of suggestions with products (name, ID), brands (name), and categories (name, ID). Shoppers can reach their desired search results more quickly using the suggested completion and correction.

### Provide Search Results

Use the Shopper Search API to gather product results for a shoppers search query.

For example, a developer who is building a shopping app using the Salesforce Commerce API would like to implement a product search functionality. When a shopper enters a search phrase and the GET Product Search endpoint is requested, the platform performs a keyword search and a sorted search result is returned. The sorted search result can be refined according to given values (for example, a price range).
The product search result contains a definable number of product search hits. A product search hit describes a matching product with its ID and name. Furthermore, the search hit contains product images, prices, represented products, and variations. In addition to the search hits, the search results also deliver refinement and sorting options. 

### Retrieve Promotion Information

Note: This only applies if `promotions` expand is provided in the query parameter.

Promotions provide discounts to shoppers when they meet certain purchase requirements.

Promotion information is described in detail in [Promotion Details](https://developer.salesforce.com/docs/commerce/commerce-api/guide/promotion-details.html), but the following list provides several key points:

- Pricing discounts for basket and shipping promotions are NEVER returned by the 'getProduct' or 'getProducts' endpoint.
- Promotional pricing is ONLY returned for products that are included with non-conditional promotions.
- Callout messages are ALWAYS returned by the 'getProduct' and 'getProducts' endpoints.

By default, 'getProduct' and 'getProducts' return promotion information for a queried product. Promotion information includes both pricing and callout message information. However, the specific pricing and callout information that is fetched is determined by:

- Promotion Type
- Product Type
- Product Purchase Requirements

Some promotions can be displayed on a Product Data Page (PDP) or Product Listing page (PLP), while other promotions are displayed in the context of a basket, such as an order level promotion: "add the product to your basket to view price information". It is important to understand what is included in the response when designing a PDP or PLP on top of SCAPI to ensure your design aligns with implementable features.

Note: When you search for a variant product, the Product Search API returns the master or main product as the primary search hit. When promotion data (productPromotion) is returned, it does not contain pricing information because the returned product is the main product. To retrieve pricing information, pass the query string `allVariationProperties=true` with the `promotions` expand parameter, which returns pricing data for variant products if the promotion is unconditional. The `allVariationProperties` flag specifies the variation properties to be included in the result.

#### Shopper Personalization
The SCAPI response can be personalized using the Shopper Context API or hooks. By setting specific values in the Shopper Context API, you can modify the response of the 'getProduct' or 'getProducts' endpoint based on the shopper's context. For instance, you can offer a 5% discount or free shipping to shoppers using mobile devices.

#### JWA Caching
The response is cached in JWA, which means promotion data contained in the response is also cached based on the TTL (Time to Live) specified in the Business Manager [Feature Switches](https://help.salesforce.com/s/articleView?id=cc.b2c_feature_switches.htm&type=5) configuration.
When the shopper context value is updated, a check is conducted to see if the updated shopper context affects the retrieval of product-promotion data. If it does, then the response is fetched from the source and cached in the JWA.

For details, see [Server-Side Web-Tier Caching.](https://developer.salesforce.com/docs/commerce/commerce-api/guide/server-side-web-tier-caching.html)


### Use Hooks

For details working with hooks, see [Extensibility with Hooks.](https://developer.salesforce.com/docs/commerce/commerce-api/guide/extensibility_via_hooks.html)

## Best Practices

These best practices refer to features that are generally available with B2C Commerce 24.3.

For better performance, when you call the GET Product Search endpoint, we recommend that you:

- Use the `select` query parameter to filter the response of a specified field or set of fields, and remove default outputs that you don't need. For example, filter the response to return only the relevant product names, ids, variants, and product IDs of the variants.
- Limit API requests to the GET Product Search endpoint instead of calling both the GET Product Search and GET Products endpoints to show information on a product listing page (PLP). Use these features to provide the additional product information needed to render product tiles:
  - **Allowable value:** `promotions` value in the `expand` query parameter
  - **Query parameters:** `perPricebook`, `allImages`, and `allVariationProperties`
  - **Responses:** `productPromotions`, `imageGroups`, `priceRanges`, `tieredPrices`, `variants`, and `variationGroups`
- Pass in only the `expand` values and query parameters that you consider necessary to meet your PLP requirements. Requesting large amounts of information can increase the latency, especially if there's a lot of data to be returned (for example, many imageGroups and variants).