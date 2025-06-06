# API Overview

The Products API enables you to build merchandising apps that merchandisers use to add products to catalogs, configure products for your storefront, and manage products in their ecommerce channels.

For more information, see [Products](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/products/b2c_products.html) in the Salesforce B2C Commerce Infocenter.

## Authentication & Authorization

The client managing product information must have access to the Products resource. This API requires a bearer token in the header of the request. The client accessing the API must first authenticate against Account Manager to get the bearer token.

You must include the relevant scope(s) in the client ID used to generate the SLAS token. For details, see the  [Authorization Scopes Catalog.](https://developer.salesforce.com/docs/commerce/commerce-api/guide/auth-z-scope-catalog.html)

## Use Cases

### Add Products

Use the Products API to add new products to a catalog. You can add or update product details like attributes, variations, variation attributes, and images. You can also use the API to change a product’s catalog assignment.

If you are adding products from an external product information management (PIM) system, use the Mulesoft Accelerator component created for Commerce Cloud.

For more detail, see [Variation Groups](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/products/b2c_variation_groups.html) in the Salesforce B2C Commerce Infocenter.

![b2c-commerce-products-screenshot-1.png](https://resources.docs.salesforce.com/rel1/doc/en-us/static/misc/b2c-commerce-products-screenshot-1.png)

### Create & Validate Variation Groups

Use the API to enable a shopper to switch between different variants on a product page. You can group variation products into variation groups or group master products by one or more attributes. The variants within a variation group are linked. Linked variants allow a shopper to switch between different variants.

For more detail, see [Variation Groups](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/products/b2c_variation_groups.html) in the Salesforce B2C Commerce Infocenter.

![b2c-commerce-products-screenshot-2.png](https://resources.docs.salesforce.com/rel1/doc/en-us/static/misc/b2c-commerce-products-screenshot-2.png)

### Search for Variants

Use the Product API to enable merchants to use a set of filtering and sorting criteria to search for variants assigned to a master product, or variation group.

For more detail, see [Product Variations](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/products/b2c_product_variations.html) in the Salesforce B2C Commerce Infocenter.

![b2c-commerce-products-screenshot-3.png](https://resources.docs.salesforce.com/rel1/doc/en-us/static/misc/b2c-commerce-products-screenshot-3.png)

### Manage Product Options

Use the API to view and manage product options for a given product so that optional accessories, upgrades, or services can be sold with the product. For example, a product warranty or monogramming.

For more detail, see [Product Options](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/products/b2c_product_options.html) in the Salesforce B2C Commerce Infocenter.

![b2c-commerce-products-screenshot-4.png](https://resources.docs.salesforce.com/rel1/doc/en-us/static/misc/b2c-commerce-products-screenshot-4.png)

## Resources

### Master Product

Represents all the variations of a particular product. The master product is a non-buyable entity that provides inheritable attributes for buyable product variants. The master product is also used as a navigation entity.

### Variation Group

Represents a group of variation products that share a common attribute, such as color or size. The variation group is a non-buyable entity that provides inheritable attributes for buyable product variants. The variation group is also used as a navigation entity.

### Variation Product

A product that is a specific variation of a master product. For example, a brand X t-shirt in size XL of the color blue. The variation product is buyable and shares most of the attributes defined for the master product. The variation product has its own product ID and can have its own images.

### Product Option

A product configured with optional accessories, upgrades, or services. For example, a laptop with different service warranties or with different size hard drives. Options are always purchased with a product and can’t be purchased separately.