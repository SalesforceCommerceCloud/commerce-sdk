Use this endpoint whenever a fully calculated and paid or authorized order is created in any third-party system.

The endpoint can create an order on-the-fly in the Commerce Cloud platform by passing the order as JSON payload in the body of the POST request.

Other than the Basket API, this endpoint decouples any relation to other system domains, such as:

- Products
- Inventory
- Promotions
- Gift certificates
- Coupons

The order isn't treated differently than any other orders in the Commerce Cloud platform, and any status updates or order exports behave the same.

**Important**: This endpoint uses the `ShopperTokenTsob` security scheme. Always check the Security section of the endpoint documentation, which is hidden by default.

## Preconditions

The checkout must happen before making a request to this endpoint. That means that all sanity checks _are_ applied, the inventory _is_ reserved, the payment _is_ authorized, and the Basket _is_ fully calculated (including all promotions).

When meeting these conditions, it's possible to create the order in the Commerce Cloud platform.

## Decoupling

This endpoint can create an order with unknown products, with different pricing for known products, any unplanned price-adjustments (unrelated to the system's configured promotions), passing unknown payment, and shipping methods.

**Note**: There's no lookup or calculation, even if the passed object is configured in the platform.

## Still Coupled

The endpoint is still coupled to the following:

- the taxation policy (gross or net) is used from the site's preferences.
- the passed currency must be defined in the site.

## Calculation

There's no multiplying or dividing operations performed by the platform on this order.

The following fields are summed up during runtime on the platform:

**Order Level**

- `adjustedMerchandizeTotalTax`
- `adjustedShippingTotalTax`
- `merchandizeTotalTax`
- `adjustedTax`
- `productSubTotal`
- `productTotal`
- `shippingTotalTax`
- `orderTotal`
- `taxTotal`

**Line Item Level**

- `priceAfterItemDiscount`
- `priceAfterOrderDiscount`
- `adjustedTax`

**Shipment**

- `merchandizeTotalTax`
- `productSubTotal`
- `productTotal`
- `shippingTotalTax`

To make sure the fields are summed up correctly, the passed `orderTotal` and `taxTotal` are compared to the platform's summed up `orderTotal` and `taxTotal`.

An `InvalidOrderTotalException` or `InvalidTaxTotalException` is thrown if the calculation doesn't match.

The `orderTotal` and `taxTotal` are calculated as follows:

- `orderTotal` = sum(`ProductLineItems.grossPrice`) + sum(`Shipments.shipmentTotal`) - sum(`ProductLineItems.PriceAdjustments.grossPrice` + `Order.PriceAdjustments.grossPrice`)
- `taxTotal` = sum (`ProductLineItems.tax`) + sum(`Shipments.taxTotal`) - sum(`ProductLineItems.PriceAdjustments.tax` + `Order.PriceAdjustments.tax`)

## Order Status

The order is automatically placed after creation.

The payment status can be set via payload.

All other status can be set via PATCH `orders/{orderNo}/status`.
