# API Overview

With the Shopper Context API, you can set any context information as a key/value pair and use it to retrieve personalized promotions, payment methods, and shipping methods. The context information that is set is evaluated against the customer group definitions to determine a customer group (shopper segment) and then used to activate the experiences that are associated with a particular segment, such as promotions.

You can also get personalized API responses triggered by shopper context from the [Open Commerce API](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/usage/OpenCommerceAPI.html) (OCAPI). Support for both the B2C Commerce API and OCAPI allows shopper context to be used in hybrid deployments.

**Warning**
**PLEASE READ CAREFULLY**: 
Access tokens whose scope includes the Shopper Context API are powerful: they can activate specific promotions and be used to see how a storefront would appear in the future. Don't share them with untrusted clients like web browsers or client apps.

It is highly recommended to use Shopper Context calls with a private client and to only make setting Shopper Context calls through a secure backend channel. Users of Shopper Context , should avoid making direct calls through a browser or similar clients where the data can be viewed , to avoid potential misuse. 

As part of this, when creating a new public client in SLAS for a tenant, if adding Shopper Context scope is attempted, a warning message is displayed to ensure the user is aware of the pitfalls of doing so.

**Note**: The context is valid for 1 day for guest shoppers and 7 days for registered shoppers. To extend the context set, create a new context. As a best practice, refresh your contexts periodically to ensure that the right personalized experience is rendered for your shoppers.

To use the Shopper Context API, you must:

- Get a JSON Web Token (JWT) for the Shopper Login and API Access Service (SLAS).
- Add `sfcc.shopper-context.rw` to the scopes configuration for the SLAS API client.

For more information, see [Authorization for Shopper APIs](https://developer.salesforce.com/docs/commerce/commerce-api/guide/authorization-for-shopper-apis.html) in the Get Started guides.

**Warning**: As with all APIs, never store access tokens in the browser because this creates a security vulnerability.

## Use Cases

For detailed usage information, see the [Shopper Context guides](https://developer.salesforce.com/docs/commerce/commerce-api/guide/shopper-context-api.html).
