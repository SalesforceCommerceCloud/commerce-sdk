# API Overview

The Shopper Products API enables you to access product details for products that are online, merchandised to a particular site catalog, and ready to be sold. You can use these product details to merchandise the product on other ecommerce channels. To set up category navigation paths on other commerce apps or storefronts, you can use the Categories API.

Caching is provided for the Shopper Products API. For details, see [Server-Side Web-Tier Caching.](https://developer.salesforce.com/docs/commerce/commerce-api/guide/server-side-web-tier-caching.html)

## Authentication & Authorization

The client requesting the product information must have access to the Products resource. The Shopper Products API requires a shopper access token from the Shopper Login and API Access Service (SLAS).

For details on how to request a shopper access token from SLAS, see the guest user flows for [public clients](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas-public-client.html#guest-user) and [private clients](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas-private-client.html#guest-user) in the SLAS guides.

You must include the relevant scope(s) in the client ID used to generate the SLAS token. For details, see the  [Authorization Scopes Catalog.](https://developer.salesforce.com/docs/commerce/commerce-api/guide/auth-z-scope-catalog.html)

## Use Cases

### Populate Product Listing Pages

Use the Shopper Product API so that a customer, browsing on a commerce shopping app built using Commerce Cloud APIs, can see a list of products. For example, hydrate a list of products (max 24). The API returns product details including images, prices, promotions, and product availability.

![b2c-commerce-shopper-products-screenshot-1.png](https://resources.docs.salesforce.com/rel1/doc/en-us/static/misc/b2c-commerce-shopper-products-screenshot-1.png)

### Get Variation Product Details on an Ecommerce Channel

Use the API so that a customer, browsing on a commerce shopping app built using Commerce Cloud APIs, can switch between different variation products. The API returns product details including images, prices, promotions, and available to sell inventory.

![b2c-commerce-shopper-products-screenshot-2.png](https://resources.docs.salesforce.com/rel1/doc/en-us/static/misc/b2c-commerce-shopper-products-screenshot-2.png)

### Retrieve Promotion Information

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

#### Shopper Personalization
The SCAPI response can be personalized using the Shopper Context API or hooks. By setting specific values in the Shopper Context API, you can modify the response of the 'getProduct' or 'getProducts' endpoint based on the shopper's context. For instance, you can offer a 5% discount or free shipping to shoppers using mobile devices.

#### JWA Caching
The response is cached in JWA, which means promotion data contained in the response is also cached based on the TTL (Time to Live) specified in the Business Manager [Feature Switches](https://help.salesforce.com/s/articleView?id=cc.b2c_feature_switches.htm&type=5) configuration.
When the shopper context value is updated, a check is conducted to see if the updated shopper context affects the retrieval of product-promotion data. If it does, then the response is fetched from the source and cached in the JWA.

For details, see [Server-Side Web-Tier Caching.](https://developer.salesforce.com/docs/commerce/commerce-api/guide/server-side-web-tier-caching.html)

### Use Hooks

For details working with hooks, see [Extensibility with Hooks.](https://developer.salesforce.com/docs/commerce/commerce-api/guide/extensibility_via_hooks.html)

## Resources

### Product

A full representation of a product or service that is to merchandise. A ready to merchandise product is one that is online, categorized, and published to a channel. The information associated with a product includes, the product name, description, custom and system attributes, variations, price, availability, and images.

### Category

Categories and subcategories are the structure by which products are organized and grouped in a catalog and on a storefront. Categories can have relationships to other categories. Further, each category can provide context that is inherited by subcategories. For example, a category can have an assigned attribute. A product assigned to that category or any subcategory inherits the categories’s attribute value. Once the product is removed from the category, the attribute value is no longer inherited by the product. You can also use category linking for site hierarchical navigation. For example, inside the Clothing category you may have Men’s, and inside the Men’s category you may have Pants.

Categories are not tags. 

## Endpoints

### GET /products

Returns product details for up to 24 products in one API request. You can use this API for use cases that require populating or hydrating multiple products at a time, such as populating the Product Listing Pages.

The response data includes availability, promotions, images, and prices, along with the basic product information for the products requested.

### GET /products/{id}

Returns product details about a single product. Use this API for use cases that require populating or hydrating one product at a time, such as the Product Detail Pages.

The response data includes availability, promotions, options, images, prices, variations, bundled_products, set_products, recommendations, and the basic product information for the product requested.

### GET /categories

Returns category details including the parent child relationships for one or more categories. The limit on depth for the parent-child relationship is 2.