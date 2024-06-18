# API Overview

The Coupons API lets you create, modify, retrieve, and delete coupons for a given channel. It also allows you to create and retrieve coupon codes by the couponID.

Coupons _must_ be added as a qualifier to a campaign before they can be used.

For more information, see [Using Coupons as Qualifiers](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/Promotions/UsingCouponsasQualifiers.html) in the Salesforce B2C Commerce Infocenter.

## Authentication & Authorization

The client requesting the coupon's information must have access to the Coupon resource. The API requests pass a bearer token in the header of the request. The client must first authenticate against Account manager to log in.

You must include the relevant scope(s) in the client ID used to generate the token. For details, see [Authorization Scopes Catalog.](https://developer.salesforce.com/docs/commerce/commerce-api/guide/auth-z-scope-catalog.html)

## Use Cases

### Single-Use Coupon

Single-use coupons are your standard coupon that can only be used once per customer.

For example, use the Coupons API to create a coupon that can be applied only once per order per customer and has a single coupon code.

### Multiple-Use Coupon

A multiple-use coupon can be used any number of times, by any number of customers.

For example, use the Coupons API to create a coupon that can be applied once per order and has system-generated codes.

### Search Coupon

Use the Coupons API to search for coupons using simple or complex querying.

### Search Coupon Redemptions

Use the Coupons API to search for coupons redemptions using simple or complex querying.

For more detail, see [Coupon Redemption](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/Coupons/CouponRedemption.html) in the Salesforce B2C Commerce Infocenter.

## Resources

### Coupons

Details of the coupon including redemption limit, redemption count, and the type of the coupon.