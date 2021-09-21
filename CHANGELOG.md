## CHANGELOG
### :warning: Planned future release will contain breaking changes :warning:
Due to an issue with the generation of the type definitions, an upcoming release
of the SDK will change type definitions to include namespaces. As this is a
breaking change, a new major version will be released (v3.0.0). Only the names of
the types will change, not their contents or any of the exported code. If you
only use JavaScript, or if you use TypeScript but only import the client classes,
then your usage **will not change**. You will likely only need to make changes if
you import the type definitions directly.

### v2.5.2
* Added support for boolean query parameters.

### v2.5.1

#### API Changes
* The *Discovery* API has added a new optional parameter `FacetRequest` to the `QueryInput` type
* The `getTrustedSystemAccessToken` endpoint has been removed from the *Shopper Login* API. It was introduced prematurely in v2.4.0 and will be reintroduced in a future release.

### v2.5.0

#### API Changes
* The endpoints `getOrder` and `getOrders` have been added to the *Orders* API.

#### Enhancements
* The SDK now sends a custom user agent with requests, `commerce-sdk@<version>;`.
If you specify your own user agent in the client config, it will be replaced.
If you specify your own user agent when making a request, it will be merged with
the SDK user agent.

### v2.4.0

#### Moved APIs
* The *Shopper Search* API is now in the *Discovery* API family. To maintain
backwards compatibility, the API is also available under the old *Search* family.
Future changes to the *Shopper Search* API will only be applied to the version in
the *Discovery* family.

#### New APIs
* *Shopper Discovery Search* has been added to the SDK.

#### API Changes
*Shopper Login*
* New endpoints

| **Endpoint Name** | **Description** |
| ------------- |-------------|
| getTrustedSystemAccessToken | Get a shopper JWT/access token, along with a refresh token for registered customers whose credentials are stored using a third party system. |

### v2.3.0

#### ** New API **
*SLAS (Shopper Login & API Authentication Service) Administration* is now supported in the SDK

#### ** API Changes**
*Shopper Customers*
* New operations
  * registerExternalProfile
  * getExternalProfile

### v2.2.0

#### ** New API **

*Shopper Login Authentication Service* is now supported in the SDK

#### ** API Changes**

*CDN Zones API*
* New operations
  * getCertificates 
  * updateCertificates  

*Shopper Login* *BETA*
* New operation
  * logoutCustomer

* Operation changed
  * authenticateCustomer changed from GET to POST
  
*Catalogs*
* New operations
  * runCategoryRules
  * getCategorizationStatus
  * createUpdateRule
  * deleteRule
  * getCategoryRuleConditions
  * deleteCategoryRuleConditions

*Products*
* New operation
  * getCategorizationAttributeDefinitions

### v2.1.1
#### **API Changes**

*CDN Zones API*
* Scopes added

*Shopper Login*
* Updates made

* Security and documentation updates made.
### v2.1.0
#### **API Changes**

*CDN Zones API*
* Endpoints Added
  * /organizations/{organizationId}/zones/{zoneId}/speed-settings
*Shopper Baskets*
* Endpoints Added
  * /organizations/{organizationId}/baskets/{basketId}/price-books

#### Documentation
* Updated Readme with Security Information.
* Added examples to retrieve shopper auth token

### v2.0.1
#### Enhancements
* Minor documentation updates

### v2.0.0
#### GA
* SDK GA Release
* All APIs are now GA except Shopper Login which is still in Beta

#### **Bug Fixes**
* Fixes an issue resolving nested data types


### v1.7.0-beta.0
#### Breaking
* Customer API now includes Shopper Login
* Types have been migrated into their corresponding class, making them easier to import.

### v1.6.0-beta.0
#### **API Changes**
None

#### **Bug Fixes**
Authentication was not being persisted by clients.

### v1.5.0-beta.0

#### **API Changes**

*Shopper Stores API*
* Shopper Stores API has been removed

*Customer API*
* Type Name Removed
  * CustomerGroupMember
  * CustomerGroup type removed from Customer API
  * Customer API
  * CustomerGroupMemberSearchResult
  * CustomerGroupMembers
  * CustomerGroupSearchResult
  * Rule

* Display Name Changed
  * CreateAddressForCustomerInCustomerList renamed to createAddressForCustomerInCustomerList

* Endpoints Removed
  * /organizations/{organizationId}/sites/{siteId}/customer-groups
  * /organizations/{organizationId}/{customerGroupId}
  * /organizations/{organizationId}/member-search
  * /organizations/{organizationId}/members
  * /organizations/{organizationId}/sites/{siteId}/customer-group-search

*Shopper Baskets API*
  * Display Name Changed
    * addTaxForBasketItem renamed to addTaxesForBasketItem

*Shopper Login SLAS*
* Shopper Login & API Access Service - SLAS renamed to Shopper Login

### **Bug Fixes**
* Authorization header is not removed for conditional get requests
* Debug logging now prints working curl commands

### **Breaking**
* Types have been moved to a types object and 'T' postfix has been removed to avoid collisions between method and type names


## CHANGELOG
### v1.4.5-beta.0

### **API Changes**

#### Shopper APIs

*Shopper Baskets API*

* New endpoints

| **Endpoint Name** | **Description** |
| ------------- |-------------|
| addTaxForBasket | Enables external taxation for the specified basket |
| addTaxForBasketItem | Add tax items in external tax mode |
| getTaxesFromBasket | Retrieves taxes for specified basket |

*Shopper Orders API*

* New endpoints

| **Endpoint Name** | **Description** |
| ------------- |-------------|
| getTaxesFromOrder | Retrieves external taxes for the specified order |

### **Bug Fixes**

* Fixed default cache issue when the HTTP response is large


### v1.4.4-beta.0

### **API Changes**

* Einstein APIs have been removed from the SDK.

### **Core Functionality**

* Exposed logger configuration to user
```javascript
import { sdkLogger } from "@commerce-sdk"

# To set log level
sdkLogger.setLevel(sdkLogger.levels.INFO);
```
* User-agent now defaults to `commerce-sdk@${VERSION}`
* Retry settings has been exposed.  README.md has more details.
Example:
```javascript
    productClient = new Product({
      retrySettings: {
        // This means 3 total calls are made
        retries: 2,
        // Max wait between retries
        maxTimeout: 200,
        // Min wait between retries
        minTimeout: 100
      }
    }
```
* Exchange connector has been removed from the commerce-sdk repository
* Method prototype documentation has been improved

### v1.4.1-beta.0
### **API Changes**

#### Product APIs
*Customer API*
* **BREAKING**: Removed endpoint method changes

  **Removed**:
  * getCustomerList

*Product API*

* **BREAKING**: Endpoint method name changes

    **Changed**:

    | **Existing Method Name** | **New Method Name** |
    | ------------- |-------------|
    | deleteVariationGroupForMaster | unassignVariationGroupFromMasterProduct |
    | updateVariationGroupInMasterProduct | updateVariationGroupForMasterProduct |
    | assignVariationGroupForMasterProduct | assignVariationGroupToMasterProduct |
    | deleteVariationForMaster | unassignVariationFromMasterProduct |
    | updateVariationsInMasterProduct | updateVariationForMasterProduct |
    | createVariationForMasterProduct | assignVariationForMasterProduct |

*Shopper Customer API*
* **BREAKING**: Removed endpoint method changes

    **Removed**:
    * getCustomerAddresses
    * getCustomerPaymentInstruments
    * getCustomerProductListItems

    **Changed**:

    | **Existing Method Name** | **New Method Name** |
    | ------------- |-------------|
    | postResetPasswordToken | getResetPasswordToken |

### **Core Functionality**

#### Enhancements

* SDK does not set TTL for cached assets based on the HTTP headers
* Added logging capability
* Exchange Connector is deprecated on commerce-sdk in favor of the raml-toolkit
* Examples of client instantiations have been added to APICLIENTS.md

### v1.4.0-beta.0

### **Core Functionality**

#### Enhancements

* Added support for Redis cache
Example:
```
import { CacheManagerRedis } from "@commerce-apps/core"

const cacheManager = new CacheManagerRedis({ connection: "redis://localhost:6379" });
const config = {
    cacheManager: cacheManager,
    parameters: {
...
    }
}
```

### **API Changes**

#### Product APIs
*Product API*

* **BREAKING**: Endpoint method name changes

| **Existing Method Name** | **New Method Name** |
| ------------- |-------------|
| deleteVariationGroupForMaster | unassignVariationGroupFromMasterProduct |
| updateVariationGroupInMasterProduct | updateVariationGroupForMasterProduct |
| assignVariationGroupForMasterProduct | assignVariationGroupToMasterProduct |
| deleteVariationForMaster | unassignVariationFromMasterProduct |
| updateVariationsInMasterProduct | updateVariationForMasterProduct |
| createVariationForMasterProduct | assignVariationForMasterProduct |

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
