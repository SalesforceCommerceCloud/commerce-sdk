## Overview
The Create Order API (GA summer 2022) should be used when a fully calculated and paid or authorized order is created in any third-party system. 

This API offers the possibility to create an order on-the-fly in the Commerce Cloud platform by passing the order as json payload in the body of the POST request.

Other than the Basket API this API decouples any relation to other system domains, such as:
- Products
- Inventory
- Promotions
- Gift certificates
- Coupons

The order isn't treated differently than any other orders in the Commerce Cloud platform, and any status updates or order exports behave the same. 

## Preconditions
The checkout should happen before the POST Order API is called. That means all sanity checks *are* applied, the inventory *is* reserved, the payment *is* authorized, and the Basket *is* fully calculated (including all promotions). 

When meeting these conditions, it's possible to create the order in the Commerce Cloud platform.

## Decoupling
This API can create an order with unknown products, with different pricing for known products, any unplanned price-adjustments (unrelated to the system's configured promotions), passing unknown payment, and shipping methods.

>There's no lookup or calculation, even if the passed object is configured in the platform.

## Still Coupled
The API is still coupled to the following:

- the taxation policy (gross or net) is used from the site's preferences.
- the passed currency must be defined in the site.

## Calculation
There's no multiplying or dividing operations performed by the platform on this order.

The following fields are summed up during runtime on the platform:

### Order Level
- `adjustedMerchandizeTotalTax`
- `adjustedShippingTotalTax`
- `merchandizeTotalTax`
- `adjustedTax`
- `productSubTotal`
- `productTotal`
- `shippingTotalTax`
- `orderTotal`
- `taxTotal`


### Line Item Level
- `priceAfterItemDiscount`
- `priceAfterOrderDiscount`
- `adjustedTax`

### Shipment
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