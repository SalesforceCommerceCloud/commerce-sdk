## CHANGELOG

### v1.3.0-alpha.8

#### Helpers

* **BREAKING**: helpers.getAuthToken method is replaced by helpers.getShopperToken

#### Endpoint Methods

* Raw response option has been moved out of the options
* Each endpoint now has overloaded function to return raw response

#### Client Configuration

* helpers.getShopperToken supports Client Configuration

#### Instantiating Clients

* **BREAKING**: API client MUST be instantiated using API name, e.g. new Product.ShopperProduct({})

#### Updated APIs 

* AI, Checkout, Shopper Orders, Shopper Baskets, and Pricing APIs

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
