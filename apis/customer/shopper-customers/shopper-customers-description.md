# API Overview

The Shopper Customers API enables you to develop functionality that lets customers log in, and manage their profiles and product lists. Profile management includes ability for shoppers to add or modify addresses and payment methods, and add or modify products to wishlists or favorites. Commerce Cloud provides a rich set of Authentication APIs that include logging in guest shoppers, registered shoppers, agents on behalf of customers and a trusted system authentication on behalf of customers. In all authentication scenarios involving customers, a JSON Web Token (JWT) is generated in Commerce Cloud. Using the JWT, customers can access other Shopper API resources like Orders and Baskets. The application must refresh the JWT every 30 minutes to save the shopper activity (for example, retain products in a shopper's cart) for prolonged periods of time.

## Authentication & Authorization

The client requesting the customer information must have access to the Customer and Product List resources. The API requests pass a system-to-system bearer token in the header of the request. For the trusted system API, the trusted client must first authenticate against Account manager to log in on behalf of a customer.

For details, see [Authorization Scopes Catalog.](https://developer.salesforce.com/docs/commerce/commerce-api/guide/auth-z-scope-catalog.html)

## Use Cases

### Register a New Customer

In this use case, a customer who is browsing on a commerce shopping app built using B2C Commerce APIs would like to create a customer profile, so that they can track their order when logged in on the next visit.

The API flow is shown in the following diagram:

![b2c-commerce-shopper-customers-screenshot-1.png](https://resources.docs.salesforce.com/rel1/doc/en-us/static/misc/b2c-commerce-shopper-customers-screenshot-1.png)

1. The shopper opens the shopping app.
2. Request an access token from SLAS. For details, see the guest user flows for [public clients](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas-public-client.html#guest-user) and [private clients](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas-private-client.html#guest-user) in the SLAS guides.
3. The SLAS API responds with the shopper access token (JWT).
4. The shopper adds a product to their basket.
5. Use the Shopper Baskets API to create a basket. The shopper JWT from SLAS is supplied in the authorization header.
6. Save the basket with a registered user customer ID (even though the shopper is still a guest). The shopper JWT from SLAS is supplied in the authorization header.
7. The shopper creates a profile.
8. Use the Shopper Customers API to register the customer.

### Authenticate a Trusted System on Behalf of a Customer

In this cross-cloud use case, a Experience Cloud user places an order on Commerce Cloud from the Experience Cloud using the platform APIs. The Experience Cloud app is a trusted system that has a trusted relationship with Commerce Cloud using the OAuth client credentials grant against the Commerce Cloud Account Manager. The Experience Cloud user logs in with a redirect to Salesforce IDM and after successful login, the client application is able to call B2C Commerce APIs on behalf of the customer. Commerce Cloud returns a JWT for the Experience Cloud user and the Experience Cloud user is able to place orders on Commerce Cloud.

The API flow is shown in the following diagram:

![b2c-commerce-shopper-customers-screenshot-2.png](https://resources.docs.salesforce.com/rel1/doc/en-us/static/misc/b2c-commerce-shopper-customers-screenshot-2.png)

### Reset Customer Password

In this use case, a shopper who is browsing on a commerce shopping app, built using B2C Commerce APIs, requests to reset their password. The app verifies the shopper's credentials and returns a 404 if verification fails. Otherwise, when the shopper requests their password to be reset, the app first creates a password reset token using the shopper’s login ID, and an account manager token (obtained using the client credentials grant). After the app has the password reset token, the app can prompt the shopper for new password. Any app-level customization, such as sending a password reset email, can be done at this step. Finally, the app calls the reset endpoint to reset the customer’s password.

![b2c-commerce-shopper-customers-screenshot-3.png](https://resources.docs.salesforce.com/rel1/doc/en-us/static/misc/b2c-commerce-shopper-customers-screenshot-3.png)

### Update Shopper LoginId

In this use case, in order to update a shopper's loginId, the PATCH /customers/{customerId} call can be used starting B2C Commerce Cloud GA release 24.7. The new field in the request called `currentPassword` is mandatory and needs to match the shopper's existing password. If this field is not provided or does not match the existing shopper password when trying to update loginId, a HTTP 400 rsponse will be returned. If the loginId field is not sent in the PATCH request body, the `currentPassword` field is not required.
**Note: After the `loginId` is updated, a new SLAS token must be fetched for the shopper for subsequent calls.

### Use Hooks

For details working with hooks, see [Extensibility with Hooks.](https://developer.salesforce.com/docs/commerce/commerce-api/guide/extensibility_via_hooks.html)

