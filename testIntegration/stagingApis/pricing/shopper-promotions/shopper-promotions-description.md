# API Overview

Retrieve information about active promotions within the context of a shopper and a site. Promotions that have been configured in the commerce platform can be retrieved using this API either by querying for particular promotion IDs, or by finding promotions associated with a campaign.

Caching is provided for the Shopper Promotions API. For details, see [Server-Side Web-Tier Caching.](https://developer.salesforce.com/docs/commerce/commerce-api/guide/server-side-web-tier-caching.html)

## Authentication & Authorization

The Shopper Promotions API requires a JSON Web Token acquired via the Shopper Customers endpoint:

```
https://{{shortcode}}.api.commercecloud.salesforce.com/customer/shopper-customers/v1/organizations/{{organizationId}}/customers/actions/login
```

You must include the relevant scope(s) in the client ID used to generate the SLAS token. For details, see [Authorization Scopes Catalog.](https://developer.salesforce.com/docs/commerce/commerce-api/guide/auth-z-scope-catalog.html)

## Use Cases

### Get Promotion by Promotion ID

Use the Shopper Promotions API to find promotion information by the promotion ID.

For example, a customer who is browsing on a commerce shopping app built using Commerce Cloud APIs can see the details about the applied promotions in the cart.

### Get Promotion by Campaign ID

Use the Shopper Promotions API to find promotion information by the campaign ID.

For example, a customer who is browsing on a commerce shopping app built using Commerce Cloud APIs can see the possible promotions that can be applied in the cart.

### Use Hooks

For details working with hooks, see [Extensibility with Hooks.](https://developer.salesforce.com/docs/commerce/commerce-api/guide/extensibility_via_hooks.html)

## Resources

### PromotionResult

A full representation of an array of promotions detail.