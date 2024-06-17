# API Overview

The Shopper Gift Certificates API lets you obtain details about a gift certificate issued to a shopper. The shopper, who received a code identifying the gift certificate, can use the gift certificate code to query information, such as the balance remaining on the gift certificate and who it was issued to, using this API.

## Authentication & Authorization

The Shopper Gift Certificates API requires a JSON Web Token acquired via the Shopper Customers endpoint.

```
https://{{shortCode}}.api.commercecloud.salesforce.com/customer/shopper-customers/v1/organizations/{{organizationId}}/customers/actions/login
```

You must include the relevant scope(s) in the client ID used to generate the SLAS token. For details, see [Authorization Scopes Catalog.](https://developer.salesforce.com/docs/commerce/commerce-api/guide/auth-z-scope-catalog.html)

## Use Cases

### Retrieve Existing Gift Certificate Details

Use Shopper Gift Certificate API to find details about a gift certificate code that shoppers enter.

For example, you can check the status of a gift certificate or see the remaining balance of a gift certificate.

### Use Hooks

For details working with hooks, see [Extensibility with Hooks.](https://developer.salesforce.com/docs/commerce/commerce-api/guide/extensibility_via_hooks.html)
