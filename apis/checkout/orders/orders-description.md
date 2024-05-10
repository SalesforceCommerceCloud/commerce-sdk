# API Overview

Use the Orders API to update order status and order payment status, edit shipping addresses and custom order properties, manage order payment instruments, and get order information.

## Authentication & Authorization

The client requesting the order information must have access to the Orders resource. The API requests pass a system-to-system bearer token in the header of the request. The `POST /orders` endpoint uses the [ShopperTokenTsob](https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-login?meta=security%3AShopperTokenTsob) security scheme.

## Update Order Statuses

An order uses several status properties to define its workflow state. Some of them are used to trigger internal processes, such as inventory allocation. Others have no default function, but are available for use with customizations.

### Order Status

The Order Status reflects the overall status of the order. Transitions between Order Statuses trigger actions such as invoice generation and release of inventory reservations.

Order Status can have one of these values:

-   `created` - Default value; denotes that the order was created in the system but is not yet placed.
-   `new` - Set this value to place the order. When you set this value, the system generates shipment and invoice numbers. After the order is placed, you can’t change its Order Status to `created` or `failed`.
-   `failed` - Set this value to fail the order, for example, when you reject the order or when its payment fails. When you set this value, the system releases the order’s inventory reservations and removes any coupon redemptions. You can only set this value if the current Order Status is `created`. If you change the Order Status from `failed` to `created`, the system tries to revert the actions taken when it was set to `failed`. If inventory isn’t available, the reversion can fail.
-   `failed_with_reopen` - Set this value to fail the order and reopen the basket, if applicable. The order status is set to `failed`.
-   `completed` - Set this value to mark the order as complete, based on your business process. For example, when the order is fully paid, exported, and shipped.
-   `cancelled` - Set this value to cancel the order, for example, when the shopper requests it. When you set this value, the system releases the order’s inventory reservations, restores any wishlist items, and removes any coupon redemptions. If you change the Order Status from `cancelled` to `completed` or `new`, the system tries to revert the actions taken when it was set to `cancelled`. If inventory isn’t available, the reversion can fail.

### Confirmation Status

An order confirmation is a document the vendor sends to the shopper. It confirms that the order has been received and accepted. You can use Confirmation Status to reflect the state of the document, or for other customizations. This field is provided for use in customizations. It isn’t associated with any default functionality.

Confirmation Status can have one of these values:

-   `not_confirmed` - Default value.
-   `confirmed` - Set this value when the order confirmation is sent to the shopper.

### Export Status

After an order is placed, it must be fulfilled. If your process includes an external fulfillment system, such as a Warehouse Management System, you can use Export Status to manage the export of order data to the external system. For example, after using the GET /orders endpoint to get order data to export, set the order’s Export Status to `exported`. When identifying orders to export, your query can include orders with Export Status `ready` and exclude orders with Export Status `exported`.

Export Status can have one of these values:

-   `not_exported` - Default value.
-   `ready` - (custom purpose) Set this value when the order is ready for export.
-   `exported` - Set this value when the order has been exported. When you set this value, the system finalizes the order’s inventory transactions.
-   `failed` - (custom purpose) Set this value when the order export fails.

### External Status

The External Status field can hold any string value. For example, you can use it for values related to an external fulfillment system. This field is provided for use in customizations. It isn’t associated with any default functionality.

### Payment Status

Use Payment Status to denote whether an order is partially or fully paid. This field is provided for use in customizations. It isn’t associated with any default functionality.

Payment Status can have one of these values:

-   `not_paid` - Default value.
-   `part_paid` - Set this value when the order is partially paid.
-   `paid` - Set this value when the order is fully paid.

### Shipping Status

Use Shipping Status to denote whether an order is partially or fully shipped. This field is provided for use in customizations. It isn’t associated with any default functionality.

Shipping Status can have one of these values:

-   `not_shipped` - Default value.
-   `part_shipped` - Set this value when the order is partially shipped.
-   `shipped` - Set this value when the order is fully shipped.

Here are some example scenarios:

-   After a successful fraud check and payment authorization, set the Order Status to `new`.
-   After a failed fraud check or payment authorization, set the Order Status to `failed`.
-   After an order’s information is exported to the warehouse system, set the Export Status to `exported`.
-   After the warehouse ships an order, set the Shipping Status to `shipped`.

## Change Shipping Address

Use the Orders API to update the shipping address on an order.

For example, a shopper places an order, then sends a request to change the shipping address on that order.

## Get Order Data

Use the Orders API system-to-system integration use cases for order retrieval, reporting, dashboards, and so on. You can get information about a single order by specifying the order number, or get information about multiple orders by searching with attribute filters.

You can use these attribute filters:

-   order status
-   export status
-   external status
-   confirmation status
-   payment status
-   shipping status
-   creation date to/from
-   last modified date to/from
-   offset
-   limit

You can sort the results in ascending or descending order by these attributes (default: descending):

-   creation date
-   last modified date

## Create Orders

Use the Create Order endpoint to create orders from a third-party system, such as a social media platform. Before using the endpoint, you must complete the checkout process first: apply all sanity checks, reserve inventory, authorize payment, apply promotions, and calculate the full cost of the order. Orders made by third-party systems are treated the same way as order made directly through the B2C Commerce platform, including how status updates and exports are handled.

## Update Orders

Use the Update Order endpoint to make changes to custom order attributes.