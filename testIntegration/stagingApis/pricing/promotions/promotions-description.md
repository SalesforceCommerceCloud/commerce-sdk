# API Overview

The Promotions API lets you create, update, retrieve, delete, and search for promotions on your site. Promotions are configured with rules that define the type of promotion, conditions, and discounts.

The API can be used to synchronize promotion data in the commerce platform with third-party promotion management systems. The API can also be called from a custom promotion management application. In sandbox environments, the promotions API can be useful for creating and updating test data, for example, with integration testing or as part of a continuous integration or continuous deployment process.

For more information, see [Campaigns and Promotions](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/promotions/b2c_campaigns_and_promotions.html) in the Salesforce B2C Commerce Infocenter.

## Authentication & Authorization

The client requesting the promotion information must have access to the Promotion resource. The API requests pass a bearer token in the header of the request. The client must first authenticate against Account Manager to get the bearer token.

You must include the relevant scope(s) in the client ID used to generate the token. For details, see [Authorization Scopes Catalog.](https://developer.salesforce.com/docs/commerce/commerce-api/guide/auth-z-scope-catalog.html)

## Use Cases

**Note**: A promotion can be created, enabled, and assigned exclusivity using the API, but qualifier and discounted criteria must be assigned in Business Manager.

### Shipping Promotions

Use the Promotions API to configure shipping promotions.

You can configure shipping promotions based on an order and on individual products or product combinations. You can also configure product-specific shipping cost (fixed or surcharge).

**Note**: Product-related shipping discounts are considered product promotions.

In a multiple ship-to scenario, B2C Commerce determines which shipments use any of the discounted shipping methods and applies the discount from most expensive to least expensive until meeting the maximum applications limit, if specified.

For example, create a shipping promotion that gives the customer free shipping when their purchase exceeds $50.

For more detail, see [Shipping Promotions](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/promotions/b2c_shipping_promotions.html) in the Salesforce B2C Commerce Infocenter.

### Product Promotions

Use the Promotions API to configure product promotions.

You can define product promotions for specific products, groups of products or brands, or amounts of products purchased. You can define conditions that require customers to purchase from a set of products.

A product promotion is prorated, calculated, and rounded once per product in the order. A product promotion is different than an order promotion, which is calculated once at the order level, and rounded off once, if necessary.

For example, create a product promotion that discounts a second item by 50% when the customer buys two.

For more detail, see [Product Promotions](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/promotions/b2c_product_promotions.html) in the Salesforce B2C Commerce Infocenter.

### Order Promotions

Use the Promotions API to configure order promotions.

You can configure order promotions for percentage discounts, fixed price discounts, and free shipping. You can offer a bonus product or a choice of bonus products, and you can tier order discounts.

An order promotion is calculated once at the order level, and rounded off once, if necessary. An order promotion is different than a product promotion, where the promotion is prorated, calculated, and rounded per product in the order.

For example, create an order promotion that discounts an entire order when the customer buys 3 qualifying items.

For more detail, see [Order Promotions](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/promotions/b2c_order_promotions.html) in the Salesforce B2C Commerce Infocenter.

## Resources

### Promotion

Details of the promotion including both the qualifying criteria and the discount.