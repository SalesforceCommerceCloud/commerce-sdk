Use this endpoint to lookup a guest order. 

**Important**: This endpoint uses the [ShopperTokenTsob](https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-login?meta=security%3AShopperTokenTsob) security scheme. Always check the Security section of the endpoint documentation, which is hidden by default.
 
The API uses the `orderViewCode` generated during the order creation and the `email` of the order customer to lookup a guest order. If email is not provided on the order, the field can be left blank in the lookup request.
**Note**: In the no email on order scenario, the custom implementation must include an additional verification of an order attribute. For example, a postal code or mobile number. 

This API can also be used for looking up an order for a registered customer. In addition to the verification steps used for guest order lookup, the API also verifies that the customer ID of the order matches with the customer ID supplied in the `ShopperTokenTsob`. 

