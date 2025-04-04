## CHANGELOG

## v4.2.0

### Enchancements
- Add helper to encode special SCAPI characters [#416](https://github.com/SalesforceCommerceCloud/commerce-sdk/pull/416)

## v4.1.0

### Enchancements
- Support Node 22 [#412](https://github.com/SalesforceCommerceCloud/commerce-sdk/pull/412)

### API Changes

*Shopper Products*

* The `expand` query parameter now includes a new argument, `page_meta_tags`

*Shopper Search*

* The `expand` query parameter now includes a new argument, `page_meta_tags`

*Shopper Context*

* `X-Geolocation` header was added to `Shopper Context`

*CDN Zones API*

* Endpoints added
  | **Endpoint Name** | **Description**                   |
  | ------------- |-----------------------------------|
  | getCodeUploadCertificates | Returns all the mTLS certificates for the account |
  | createCodeUploadCertificate | Set up two-factor mTLS certificates for the account and associate the staging zone code upload hostname |
  | getCodeUploadCertificate | Returns the mTLS certificate for the given account's mTLS certificate ID |
  | deleteCodeUploadCertificate | Successfully deleted the mTLS certificate from the account |


## v4.0.0

### :warning: Planned API Changes :warning: 

#### Shopper Context

Starting July 31st 2024, all endpoints in the Shopper context API will require the `siteId` parameter for new customers. This field is marked as optional for backward compatibility and will be changed to mandatory tentatively by January 2025. You can read more about the planned change [here](https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-context?meta=Summary) in the notes section.

#### Shopper Login (SLAS)

SLAS will soon require new tenants to pass `channel_id` as an argument for retrieving guest access tokens. You can read more about the planned change [here](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas.html#guest-tokens).

Please be aware that existing tenants are on a temporary allow list and will see no immediate disruption to service.  We do ask that all users seek to adhere to the `channel_id` requirement before the end of August to enhance your security posture before the holiday peak season.

In practice, we recommend that customers using the SLAS helper functions upgrade to `v4.0.0` of the `commerce-sdk`.

### Enchancements

- Update SLAS helper function `loginGuestUserPrivate` to require `channel_id` and `loginGuestUser` to pass in `channel_id` to SLAS through `clientConfig.parameters.siteId` [#406](https://github.com/SalesforceCommerceCloud/commerce-sdk/pull/406)

### API Changes

*CDN Zones API*

* Endpoints added
  | **Endpoint Name** | **Description**                   |
  | ------------- |-----------------------------------|
  | getOwaspWafPackage | Get a OWASP ModSecurity Core Rule Set. |
  | patchOwaspWafPackage | Patch a OWASP ModSecurity Core Rule Set. |
  | getWafManagedRulesInRuleset | Retrieves all rules in the specified WAFv2 managed ruleset. |
  | updateWafManagedRuleInRuleset | Updates a WAF managed rule in the specified WAFv2 managed ruleset. |
  | migrateZoneToWafV2 | Migrates a zone to WAFv2. Only applicable for existing zones using WAFv1. |
  | upsertOriginHeaderModification | Upsert origin header modification. |
  | getOriginHeaderModification | Get origin header modification associated with a zone. |
  | deleteOriginHeaderModification | Delete the origin header modification associated with a zone. |

* **BREAKING**: Removed deprecated endpoints
  * getFirewallRules
  * createFirewallRule
  * getFirewallRule
  * updateFirewallRule
  * deleteFirewallRule

  NOTE: As of February 6th, 2024, firewall rules are deprecated and customers can use [eCDN custom rules](https://developer.salesforce.com/docs/commerce/commerce-api/guide/cdn-zones-custom-rules.html) moving forward.

## v3.1.0

### API Changes
*Shopper Baskets*

  | **Endpoint Name** | **Description**                   |
  | ------------- |-----------------------------------|
  | updateItemsInBasket | Updates multiple items in a basket. |

## v3.0.0

#### API Changes

*Shopper Customers*

- Removal of deprecated endpoints:
  - `invalidateCustomerAuth`
  - `authorizeCustomer`
  - `authorizeTrustedSystem`

*Shopper Orders*

  | **Endpoint Name** | **Description** |
  | ------------- |-------------|
  | guestOrderLookup | Lookup a guest order |

*Customers*

  | **Endpoint Name** | **Description** |
  | ------------- |-------------|
  | searchCustomerGroup | Search for customer groups in a given Site Id |

*Coupons*

  | **Endpoint Name** | **Description** |
  | ------------- |-------------|
  | redeemCoupon | Redeems a coupon code for an existing coupon within the selected site. The coupon code must be redeemable. |

#### Enchancements

- Add helper function `customApiHelper.callCustomEndpoint` to call [Custom APIs](https://developer.salesforce.com/docs/commerce/commerce-api/guide/custom-apis.html) - [#402](https://github.com/SalesforceCommerceCloud/commerce-sdk/pull/402)

#### Other Changes

- Removal of deprecated helper function `getShopperToken`

## v2.15.0

#### API Changes

- Update APIs for [Shopper Search](https://developer.salesforce.com/docs/commerce/commerce-api/references/about-commerce-api/about.html#282024)

* New Endpoints

  | **Endpoint Name** | **Description**                   |
  | ------------- |-----------------------------------|
  | getWafManagedRulesets | Retrieves WAFv2 managed rulesets. |
  | updateWafManagedRuleset | Updates WAFv2 managed ruleset.    |  

## v2.14.0

* Shopper SEO API*

* New Endpoints

  | **Endpoint Name** | **Description** |
  | ------------- |-------------|
  | getUrlMapping | Gets URL mapping information for a URL that a shopper clicked or typed in. The mapping information is based on URL rules and redirects set up in Business Manager. For more information about prerequisites and sample usage, see [URL Resolution](/docs/commerce/commerce-api/guide/url-resolution.html). You can customize the behavior of this endpoint by using hooks. See the hooks for getUrlMapping in the [Hook List](https://developer.salesforce.com/docs/commerce/commerce-api/guide/hook_list.html).|


## v2.13.0

#### Enchancements

* Add support for custom query parameters [#396](https://github.com/SalesforceCommerceCloud/commerce-sdk/pull/396)

## v2.12.0

#### New APIs

* *Shopper Experience* has been added to the SDK.

## v2.11.2

#### Bug fixes

- Mark `expand` query parameter for `getProduct` endpoint as optional instead of required

### v2.11.1

#### Bug fixes

- Fix `expand` query parameter for `shopper-products`
- Remove `retrieveCredQualityUserInfo` endpoint from `shopper-login` as this functionality was removed from SLAS

### v2.11.0

#### API Changes

*CDN Zones API*

* New Endpoints

  | **Endpoint Name** | **Description** |
  | ------------- |-------------|
  | getSecuritySettings | Retrieve security settings for a zone |
  | updateSecuritySettings | Update security settings for a zone |
  | deleteCertificate | This action deletes a custom hostname and the certificate associated with it. Note that a valid certificate is necessary for a site to remain operational. DELETING AN IN-USE CERTIFICATE MAY RESULT IN DOWNTIME |
  | createMrtRules | Create MRT rules |
  | updateMrtRuleset | Update the MRT hostname or add MRT rules to the ruleset |
  | getMrtRules | Get MRT rules associated with a zone |
  | deleteMrtRuleset | Delete the MRT ruleset specified for that particular zone |
  | deleteMrtRule | elete an MRT rule in the specified ruleset |
  | updateMrtRule | Update the expression and enable or disable an MRT rule |
  | createLogpushOwnership | Create Logpush ownership token file |
  | createLogpushJob | Create Logpush job |
  | listLogpushJob | List Logpush job |
  | getLogpushJob | Get Logpush job details |
  | updateLogpushJob | Update Logpush job |
  | deleteLogpushJob | Delete Logpush job by job ID |
  | createCustomRule | Creates a custom rule |
  | getCustomRules | Retrieves existing custom rules |
  | updateOrderOfCustomRules | Updates the order of all existing custom rules |
  | getCustomRule | Retrieves a specific custom rule |
  | updateCustomRule | Updates a specific custom rule |
  | deleteCustomRule | Deletes a specific custom rule |
  | createRateLimitingRule | Creates a rate limiting rule |
  | getRateLimitingRules | Retrieves existing rate limiting rules |
  | getRateLimitingRule | Retrieves a specific rate limiting rule |
  | updateRateLimitingRule | Updates a specific rate limiting rule |
  | deleteRateLimitingRule | Deletes a specific rate limiting rule |

*Shopper Baskets API*

* New Endpoints

  | **Endpoint Name** | **Description** |
  | ------------- |-------------|
  | updateAsAgentBasket | Marks a basket as an agent basket |
  | addPriceAdjustmentToBasket | Adds a custom manual price adjustment to the basket |
  | removePriceAdjustmentFromBasket | Removes a custom manual price adjustment from the basket |
  | updatePriceAdjustmentInBasket | Updates a custom manual price adjustment on the basket. Only the following path values are considered for the update (`discount`, `itemText`, `reasonCode`, `custom properties`); all other attributes are ignored. The discount `type` of a price adjustment cannot be updated and therefore, the value of the existing type must be passed. For an adjustment of type `percentage`, the `percentage` attribute is mandatory. For adjustments of type `amount` and `fixed_price`, the `amount` attribute is mandatory.|
  | updateAsStorefrontBasket | Marks a basket as a storefront basket |

*SLAS Admin API*

* New Endpoints

  | **Endpoint Name** | **Description** |
  | ------------- |-------------|
  | retrievePwdlessTemplate | Retrieve/get a password action template |
  | registerPwdlessTemplate | Create or update a password action template |
  | deletePwdlessTemplate | Delete a password action template |

* Removed Endpoints
  - `retrieveCredQuailtyStats` and `retrieveCredQuailtyUserStats` endpoints have been removed as that functionality has been eliminated from SLAS and no customers were using these operations. 

#### Documentation

* Admin API examples have been updated in the [generated documentation site](https://salesforcecommercecloud.github.io/commerce-sdk/)

### v2.10.1

#### **Bug Fixes**

* Fixes `nanoid` dependency issue

### v2.10.0

#### API Changes

*CDN Zones API*

* New Endpoints

  | **Endpoint Name** | **Description** |
  | ------------- |-------------|
  | validateCustomHostname | Restart the validation checks for a given custom hostname for a particular zone |

*Shopper Login*

* New Endpoints

  | **Endpoint Name** | **Description** |
  | ------------- |-------------|
  | getSessionBridgeAccessToken | Get a shopper JWT access token for a registered customer using session bridge |
  | getTrustedAgentAuthorizationToken | Obtains a new agent on behalf authorization token for a registered customer |
  | getTrustedAgentAccessToken | Get a shopper JWT access token for a registered customer using a trusted agent (Merchant) |

### v2.9.0

#### API Changes

*CDN Zones API*

* Removal of non operational endpoint `workerUpdate`
* New Endpoints

  | **Endpoint Name** | **Description** |
  | ------------- |-------------|
  | createStorefrontZone | Create a new storefront zone |
  | cachePurge | Request to purge the cache for the host given in the request body |
  | toggleOcapiCachingPageRule | Request to enable or disable OCAPI Caching page rule |
  | addCertificateForZone | Add Certificates For Zone |


*Orders API*

* New Endpoints

  | **Endpoint Name** | **Description** |
  | ------------- |-------------|
  | createOrders | Create an order in the Commerce Cloud platform by passing the order as json payload in the body of the POST request |

*Shopper Login (SLAS) Admin*

* Removal of non-operational endpoints `retrieveTenants` and `deleteTenant`

#### **Bug Fixes**

* Fixes SLAS endpoints `getPasswordResetToken` and `resetPassword`

### v2.8.0

#### Enchancements

* SLAS helper functions have been added
* `fetchOptions` are able to be passed to modify the fetch call behavior

#### API Changes

*Shopper Login*

* New Endpoints

  | **Endpoint Name** | **Description** |
  | ------------- |-------------|
  | getPasswordResetToken | Request a reset password token |
  | resetPassword | Creates a new password |

#### Documentation

* Code examples have been added for the SLAS helpers and registering a shopper
* `README` has been updated to reflect support for Node 16 LTS
### v2.7.1

#### Documentation

Sample data has been updated to use inclusive language. 

### v2.7.0

#### New APIs

* *Shopper Context* has been added to the SDK.

#### API Changes

*Shopper Login*

* New Endpoints

  | **Endpoint Name** | **Description** |
  | ------------- |-------------|
  | authorizePasswordlessCustomer | Logs a customer in using Core with their customer profiles loaded in ECOM. Allows the user to authenticate when their identity provider (Core) is down. |
  | getPasswordLessAccessToken | Evaluate the `pwdless_token` and issue the shopper token (JWT). |

### v2.6.1

#### Bug Fixes

* The `Content-Type` header is now set for all requests with payloads, enabling the *Shopper Login* endpoints to work as expected.

### v2.6.0

#### API Changes

*CDN Zones*

* New endpoints

| **Endpoint Name** | **Description** |
| ------------- |-------------|
| workerUpdate | Updates the worker for the zone to the specified version |

*Shopper Baskets*

* New endpoints

| **Endpoint Name** | **Description** |
| ------------- |-------------|
| transferBasket | Transfer the previous shopper's basket to the current shopper by updating the basket's owner. No other values change. You must obtain the shopper authorization token via SLAS, and it must contain both the previous and current shopper IDs. |
| mergeBasket | Merge data from the previous shopper's basket into the current shopper's active basket and delete the previous shopper's basket. This endpoint doesn't merge Personally Identifiable Information (PII). You must obtain the shopper authorization token via SLAS, and it must contain both the previous and current shopper IDs. After the merge, all basket amounts are recalculated and totaled, including lookups for prices, taxes, shipping, and promotions. |
| updatePaymentInstrumentInBasket | Success, the response body contains the basket with the updated payment instrument. |

*Shopper Login*

* New endpoints

| **Endpoint Name** | **Description** |
| ------------- |-------------|
| retrieveCredQualityUserInfo | Retrieve credential quality statistics for a user. |
| getTrustedSystemAccessToken | Get a shopper JWT/access token for registered customers whose credentials are stored using a third party system.</br></br>Mandatory fields for <b>Trusted On Behalf Of</b> to get an access token are grant_type, hint, login_id, login_origin, and channel_id.</br></br>Valid grant type for <b>Trusted On Behalf Of</b> is <i>client_credentials.</i></br></br>For<b>Trusted System External On Behalf Of</b> a basic auth authorization header of SLAS client id and SLAS client secret should be used in place of the bearer Token.</br></br>For <b>Trusted System Internal On Behalf Of </b>the authorization header bearer token should be a C2C JWT.</br> |

*SLAS Admin*

* New endpoints

| **Endpoint Name** | **Description** |
| ------------- |-------------|
| retrieveCredQuailtyStats | Retrieve credential quality statistics for a user. |
| retrieveCredQuailtyUserStats | Retrieve credential quality statistics for a tenant. |

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

#### **New API**

*SLAS (Shopper Login & API Authentication Service) Administration* is now supported in the SDK

#### **API Changes**

*Shopper Customers*

* New operations
  * registerExternalProfile
  * getExternalProfile

### v2.2.0

#### **New API**

*Shopper Login Authentication Service* is now supported in the SDK

#### **API Changes**

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
