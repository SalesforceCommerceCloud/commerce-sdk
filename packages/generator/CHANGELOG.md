## CHANGELOG

### v1.3.1-alpha.0

### **Core Functionality**

#### Enhancements

* Request body of the endpoints now have data types
    Example:
    ```
    updateOrder(
            options: {
              parameters?: {
                organizationId?: string
                orderNo: string
                siteId?: string
              },
              headers?: { [key: string]: string },
              body: OrderUpdateRequestT
            }
          ): Promise<void>;
    ```
_____________________________________________

### v1.3.0-alpha.9

### **Core Functionality**

#### Authentication helper changes

* ShopperToken now contains customer info from auth response
    * Potentially breaking if you are currently instantiating a ShopperToken yourself

#### Enhancements

* SDK now returns the cached asset on HTTP 304 response
* SDK now closes the network connection by default
    * It can be kept open by passing a Connection header set to keep-alive
* Parameters in API methods now have specific data types

    Example:
    ```
    productSearch(
        options?: {
            parameters?: {
            organizationId?: string
            siteId?: string
            q?: string
            refine?: Array<string>
            sort?: string
            currency?: string
            locale?: string
            offset?: number
            limit?: number
            },
            headers?: { [key: string]: string }
        }
    ): Promise<ProductSearchResultT>;
    ```

#### Documentation
* VERSION.md has been renamed to APICLIENTS.md
    * APICLIENTS.md now links to developer.commercecloud.com

### **API Changes**

#### CDN APIs
*CDN Zones/CDN API*  

* **BREAKING**: API client `CdnApi` has been renamed to `CdnZones`

* **BREAKING**: Endpoint method name changes

| **Existing Method Name** | **New Method Name** |
| ------------- |-------------|
| getZoneInfo | getZonesInfo |
| updateWafGroupById | updateWafGroup |
| updateWafRuleById | updateWafRule |
| updateFirewallRuleById | updateFirewallRule |

_____________________________________________

### v1.3.0-alpha.8

### **Core Functionality**

#### Authentication helper changes

* **BREAKING**: helpers.getAuthToken method is replaced by helpers.getShopperToken
* helpers.getShopperToken supports Client Configuration. Refer to [Sample Code](./README.md#Sample Code)

#### API Clients

* **BREAKING**: API client MUST be instantiated using API name, e.g. `new Product.ShopperProduct(clientConfig)`

#### Endpoint Methods

* **BREAKING**: Raw response option has been moved out of the options
* Each endpoint now has overloaded method to return raw response

#### Additional Properties

* Unrestricted type definitions now accepts additonal properties
* Refer to this [article](https://help.mulesoft.com/s/article/How-to-restrict-additional-properties-in-a-RAML) to learn about additional properties

### **API Changes**

#### Shopper Baskets
*Checkout/ShopperBaskets*  

* **BREAKING**: Endpoint method name changes

| **Existing Method Name** | **New Method Name** |
| ------------- |-------------|
| postBaskets | createBasket |
| deleteBasketsById | deleteBasket |
| getBasketsById | getBasket |
| patchBasketsById | updateBasket | 
| putBasketsByIdBillingAddress | updateBillingAddressForBasket | 
| postBasketsByIdCoupons | addCouponToBasket |
| deleteBasketsByIdCouponsById | removeCouponFromBasket |
| putBasketsByIdCustomer | updateCustomerForBasket |
| postBasketsByIdGiftCertificateItems | addGiftCertificateItemToBasket | 
| deleteBasketsByIdGiftCertificateItemsById | removeGiftCertificateItemFromBasket |
| postBasketsByIdItems | addItemToBasket |
| deleteBasketsByIdItemsById | removeItemFromBasket |
| patchBasketsByIdItemsById | updateItemInBasket |
| postBasketsByIdPaymentInstruments | addPaymentInstrumentToBasket |
| deleteBasketsByIdPaymentInstrumentsById | removePaymentInstrumentFromBasket |
| getBasketsByIdPaymentMethods | getPaymentMethodsForBasket |
| postBasketsByIdShipments | createShipmentForBasket |
| deleteBasketsByIdShipmentsById | removeShipmentFromBasket |
| patchBasketsByIdShipmentsById | updateShipmentForBasket |
| putBasketsByIdShipmentsByIdShippingAddress | updateShippingAddressForShipment |
| putBasketsByIdShipmentsByIdShippingMethod | updateShippingMethodForShipment |
| getBasketsByIdShipmentsByIdShippingMethods | getShippingMethodsForShipment |


#### Shopper Orders
*Checkout/ShopperOrders*  

* **BREAKING**: Endpoint method name changes

| **Existing Method Name** | **New Method Name** |
| ------------- |-------------|
| postOrders | createOrder |
| getOrdersById | getOrder |
| postOrdersByIdPaymentInstruments | createPaymentInstrumentForOrder |
| deleteOrdersByIdPaymentInstrumentsById | removePaymentInstrumentFromOrder |
| patchOrdersByIdPaymentInstrumentsById | updatePaymentInstrumentForOrder |
| getOrdersByIdPaymentMethods | getPaymentMethodsForOrder |

#### Einstein Recommendations
*AI/EinsteinQuickStartGuide*  

* Recommender type has a new recommenderType attribute
* RecommendationsResponse type has a new recoUUID attribute
* ZoneResponse type has a new recoUUID attribute
* Added new Recommendation type

#### Coupons
*Pricing/Coupons*  

* getCoupon now has an optional query parameter of "expand" which accepts an array of related attributes

_____________________________________________

### v1.3.0-alpha.7

#### Shopper Search
*Search/ShopperSearch*  

* **BREAKING** refine_n query parameters have been removed from productSearch
* productSearch now has a query parameter of "refine" which accepts an array of refinements

#### Shopper Stores
*Seller/ShopperStores*  

* Now uses updated standards so 'limit' is no longer a required parameter for paginated endpoints
* Max limit for paginated endpoints increased from 50 to 200

_____________________________________________

### v1.3.0-alpha.6

Initial public release
