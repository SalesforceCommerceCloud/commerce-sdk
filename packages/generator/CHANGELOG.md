## CHANGELOG

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
