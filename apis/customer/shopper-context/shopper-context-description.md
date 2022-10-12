# API Overview

_**Note:** This feature is a Beta Service. You may opt-in to try this service at your sole discretion. Any use of this service is subject to the [Customer Agreements and User Terms for Products and Services](https://www.salesforce.com/company/legal/agreements/)._

With the Shopper Context API, you can set any context information as a key/value pair and use it to retrieve personalized promotions, payment methods, and shipping methods. The context information that is set is evaluated against the customer group definitions to determine a customer group (shopper segment) and then used to activate the experiences that are associated with a particular segment, such as promotions.

## Authentication & Authorization

To use the Shopper Context API, you must:

-   Get a JSON Web Token (JWT) for the Shopper Login and API Access Service (SLAS).
-   Add `sfcc.shopper-context.rw` to the scopes configuration for the SLAS API client.

## Use Cases

### Get Personalized Promotions, Shipping Methods, and Payment Methods for a Basket

Set any session-based qualifiers (for example, `session.deviceType = 'Mobile'`) and retrieve promotions that can be activated for a customer group.

![shopper-context.png](https://resources.docs.salesforce.com/rel1/doc/en-us/static/misc/shopper-context.png)

### Shop the Future

To retrieve promotions that are active within a particular time window, set an effective date as a context parameter. The effective date enables you to build functionality where shoppers can preview promotions for a future shopping session.

![shopper-context-2.png](https://resources.docs.salesforce.com/rel1/doc/en-us/static/misc/shopper-context-2.png)
