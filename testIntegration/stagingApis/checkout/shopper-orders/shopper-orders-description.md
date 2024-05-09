# API Overview

The Shopper Orders API enables you to:

- Create orders based on baskets prepared using the Shopper Baskets API.
- Add a customer's payment instrument to an order.

You can choose to supply the full payment information or supply only a customer payment instrument ID and amount. If the customer payment instrument ID is set, all the other properties (except amount) are ignored and the payment data is resolved from the stored customer payment information.

**Note:** The API doesn’t allow the storage of credit card numbers. The endpoint provides the storage of masked credit card numbers only.

To update the payment status, use the Orders API.

## Use Cases

### Use Hooks

For details on working with hooks, see [Extensibility with Hooks.](https://developer.salesforce.com/docs/commerce/commerce-api/guide/extensibility_via_hooks.html)