# API Overview

With the Shopper Context API, you can set any context information as a key/value pair and use it to retrieve personalized promotions, payment methods, and shipping methods. The context information that is set is evaluated against the customer group definitions to determine a customer group (shopper segment) and is then used to activate the experiences that are associated with a particular segment, such as promotions.

You can also get personalized API responses using Shopper Context in the [Open Commerce API](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/usage/OpenCommerceAPI.html) (OCAPI). Support for both the B2C Commerce API and OCAPI allows shopper context to be used in hybrid deployments.

**Warning**
Access tokens whose scope includes the Shopper Context API are powerful: they can activate specific promotions and be used to see how a storefront would appear in the future.

Recommended usage of Shopper Context is setting context using a secure backend channel with a private client. Do not make direct calls through a browser or similar client in which the data can be viewed. 

If you attempt to add a Shopper Context scope for a tenant when creating a new public client in SLAS, a warning message is displayed.

**Note**:

For guest shoppers, the context is valid for 1 day and for registered shoppers, 7 days. To extend the context set, create a new context. As a best practice, periodically refresh your contexts to ensure that the right personalized experience is rendered for your shoppers.

With B2C Commerce release 24.5, all new implementations of Shopper Context require the `siteId` query parameter to be passed. Existing customers with Shopper Context implementations should start including `siteId` going forward. Starting July 31 2024, `siteId` is required for all new customers, and a bad request response code is returned for requests without a `siteId`.

## Authentication & Authorization

To use the Shopper Context API, you must:

- Get a JSON Web Token (JWT) for the Shopper Login and API Access Service (SLAS).
- Add `sfcc.shopper-context.rw` to the scopes configuration for the SLAS API client.

For more information, see [Authorization for Shopper APIs](https://developer.salesforce.com/docs/commerce/commerce-api/guide/authorization-for-shopper-apis.html) in the Get Started guides.

**Warning**: As with all APIs, never store access tokens in the browser because this creates a security vulnerability.

## Use Cases

To integrate Shopper Context API geolocation features with your storefront, see [Shopper Geolocation](https://developer.salesforce.com/docs/commerce/commerce-api/guide/shopper-context-geolocation.html).

For additional usage information, see the [Shopper Context Guides](https://developer.salesforce.com/docs/commerce/commerce-api/guide/shopper-context-api.html).
