# Included APIs

Each of the following APIs has a corresponding client in the SDK which can be instantiated to communicate with that API.

## AI

### [Einstein Recommendations](https://developer.commercecloud.com/s/api-details/a003k00000UI4hPAAT)

*Get Einstein recommendations and send activities to Einstein engine.*

To instantiate a client:

```typescript
import { Ai, ClientConfig } from "commerce-sdk";
// or
const { Ai, ClientConfig } = require("commerce-sdk");

const config: ClientConfig = { /* ... */ };
const einsteinQuickStartGuideClient = new Ai.EinsteinQuickStartGuide(config);
```

## CDN

### [CDN Zones](https://developer.commercecloud.com/s/api-details/a003k00000UIKk2AAH)

*Extend your eCDN beyond Business Manager configuration.*

To instantiate a client:

```typescript
import { Cdn, ClientConfig } from "commerce-sdk";
// or
const { Cdn, ClientConfig } = require("commerce-sdk");

const config: ClientConfig = { /* ... */ };
const cdnZonesClient = new Cdn.CdnZones(config);
```

## Checkout

### [Orders](https://developer.commercecloud.com/s/api-details/a003k00000UHvp4AAD)

*Manage order status and order payment status.*

To instantiate a client:

```typescript
import { Checkout, ClientConfig } from "commerce-sdk";
// or
const { Checkout, ClientConfig } = require("commerce-sdk");

const config: ClientConfig = { /* ... */ };
const ordersClient = new Checkout.Orders(config);
```

**Mule App Version:** 1.0.12

### [Shopper Baskets](https://developer.commercecloud.com/s/api-details/a003k00000UHvpEAAT)

*Build a checkout experience.*

To instantiate a client:

```typescript
import { Checkout, ClientConfig } from "commerce-sdk";
// or
const { Checkout, ClientConfig } = require("commerce-sdk");

const config: ClientConfig = { /* ... */ };
const shopperBasketsClient = new Checkout.ShopperBaskets(config);
```

**Mule App Version:** 0.0.34

### [Shopper Orders](https://developer.commercecloud.com/s/api-details/a003k00000UHvpFAAT)

*Finish the shopper checkout experience resulting in an order.*

To instantiate a client:

```typescript
import { Checkout, ClientConfig } from "commerce-sdk";
// or
const { Checkout, ClientConfig } = require("commerce-sdk");

const config: ClientConfig = { /* ... */ };
const shopperOrdersClient = new Checkout.ShopperOrders(config);
```

**Mule App Version:** 0.0.21

## Customer

### [Customers](https://developer.commercecloud.com/s/api-details/a003k00000UHvouAAD)

*Manage customer lists, and search and manage customer groups.*

To instantiate a client:

```typescript
import { Customer, ClientConfig } from "commerce-sdk";
// or
const { Customer, ClientConfig } = require("commerce-sdk");

const config: ClientConfig = { /* ... */ };
const customersClient = new Customer.Customers(config);
```

**Mule App Version:** 0.0.10

### [Shopper Customers](https://developer.commercecloud.com/s/api-details/a003k00000UHvpJAAT)

*Let customers log in and manage their profiles and product lists.*

To instantiate a client:

```typescript
import { Customer, ClientConfig } from "commerce-sdk";
// or
const { Customer, ClientConfig } = require("commerce-sdk");

const config: ClientConfig = { /* ... */ };
const shopperCustomersClient = new Customer.ShopperCustomers(config);
```

**Mule App Version:** 0.0.17

## Pricing

### [Assignments](https://developer.commercecloud.com/s/api-details/a003k00000UHvoaAAD)

*Enable merchandisers to search for assignments.*

To instantiate a client:

```typescript
import { Pricing, ClientConfig } from "commerce-sdk";
// or
const { Pricing, ClientConfig } = require("commerce-sdk");

const config: ClientConfig = { /* ... */ };
const assignmentsClient = new Pricing.Assignments(config);
```

**Mule App Version:** 1.0.13

### [Campaigns](https://developer.commercecloud.com/s/api-details/a003k00000UHvobAAD)

*Create, update, and manage campaigns.*

To instantiate a client:

```typescript
import { Pricing, ClientConfig } from "commerce-sdk";
// or
const { Pricing, ClientConfig } = require("commerce-sdk");

const config: ClientConfig = { /* ... */ };
const campaignsClient = new Pricing.Campaigns(config);
```

**Mule App Version:** 1.0.15

### [Coupons](https://developer.commercecloud.com/s/api-details/a003k00000UHvopAAD)

*Create, update, read, search for, and manage coupons.*

To instantiate a client:

```typescript
import { Pricing, ClientConfig } from "commerce-sdk";
// or
const { Pricing, ClientConfig } = require("commerce-sdk");

const config: ClientConfig = { /* ... */ };
const couponsClient = new Pricing.Coupons(config);
```

**Mule App Version:** 1.0.15

### [Gift Certificates](https://developer.commercecloud.com/s/api-details/a003k00000UHvozAAD)

*Create, get, and update gift certificates.*

To instantiate a client:

```typescript
import { Pricing, ClientConfig } from "commerce-sdk";
// or
const { Pricing, ClientConfig } = require("commerce-sdk");

const config: ClientConfig = { /* ... */ };
const giftCertificatesClient = new Pricing.GiftCertificates(config);
```

**Mule App Version:** 1.0.17

### [Promotions](https://developer.commercecloud.com/s/api-details/a003k00000UHvp9AAD)

*Create, get, and update promotions.*

To instantiate a client:

```typescript
import { Pricing, ClientConfig } from "commerce-sdk";
// or
const { Pricing, ClientConfig } = require("commerce-sdk");

const config: ClientConfig = { /* ... */ };
const promotionsClient = new Pricing.Promotions(config);
```

**Mule App Version:** 1.0.12

### [Shopper Gift Certificates](https://developer.commercecloud.com/s/api-details/a003k00000UHvogAAD)

*Obtain details about a gift certificate.*

To instantiate a client:

```typescript
import { Pricing, ClientConfig } from "commerce-sdk";
// or
const { Pricing, ClientConfig } = require("commerce-sdk");

const config: ClientConfig = { /* ... */ };
const shopperGiftCertificatesClient = new Pricing.ShopperGiftCertificates(config);
```

**Mule App Version:** 1.0.6

### [Shopper Promotions](https://developer.commercecloud.com/s/api-details/a003k00000UHvp5AAD)

*Obtain promotion details.*

To instantiate a client:

```typescript
import { Pricing, ClientConfig } from "commerce-sdk";
// or
const { Pricing, ClientConfig } = require("commerce-sdk");

const config: ClientConfig = { /* ... */ };
const shopperPromotionsClient = new Pricing.ShopperPromotions(config);
```

**Mule App Version:** 1.0.15

### [Source Code Groups](https://developer.commercecloud.com/s/api-details/a003k00000UHvpTAAT)

*Create, update, delete, and search for source code groups.*

To instantiate a client:

```typescript
import { Pricing, ClientConfig } from "commerce-sdk";
// or
const { Pricing, ClientConfig } = require("commerce-sdk");

const config: ClientConfig = { /* ... */ };
const sourceCodeGroupsClient = new Pricing.SourceCodeGroups(config);
```

**Mule App Version:** 1.0.16

## Product

### [Catalogs](https://developer.commercecloud.com/s/api-details/a003k00000UHvofAAD)

*Create, manage, and search categories and catalogs within a merchandizing system.*

To instantiate a client:

```typescript
import { Product, ClientConfig } from "commerce-sdk";
// or
const { Product, ClientConfig } = require("commerce-sdk");

const config: ClientConfig = { /* ... */ };
const catalogsClient = new Product.Catalogs(config);
```

**Mule App Version:** 0.0.11

### [Products](https://developer.commercecloud.com/s/api-details/a003k00000UHvovAAD)

*Create, manage, and search products within a merchandizing system.*

To instantiate a client:

```typescript
import { Product, ClientConfig } from "commerce-sdk";
// or
const { Product, ClientConfig } = require("commerce-sdk");

const config: ClientConfig = { /* ... */ };
const productsClient = new Product.Products(config);
```

**Mule App Version:** 0.0.10

### [Shopper Products](https://developer.commercecloud.com/s/api-details/a003k00000UHvp0AAD)

*Let customers view product and category details in shopping apps.*

To instantiate a client:

```typescript
import { Product, ClientConfig } from "commerce-sdk";
// or
const { Product, ClientConfig } = require("commerce-sdk");

const config: ClientConfig = { /* ... */ };
const shopperProductsClient = new Product.ShopperProducts(config);
```

**Mule App Version:** 0.0.11

## Search

### [Shopper Search](https://developer.commercecloud.com/s/api-details/a003k00000UHwuFAAT)

*Perform product search and provide search suggestions.*

To instantiate a client:

```typescript
import { Search, ClientConfig } from "commerce-sdk";
// or
const { Search, ClientConfig } = require("commerce-sdk");

const config: ClientConfig = { /* ... */ };
const shopperSearchClient = new Search.ShopperSearch(config);
```

**Mule App Version:** 1.0.21

## Seller

### [Shopper Stores](https://developer.commercecloud.com/s/api-details/a003k00000UHwuPAAT)

*Search for a specific store or stores in an area.*

To instantiate a client:

```typescript
import { Seller, ClientConfig } from "commerce-sdk";
// or
const { Seller, ClientConfig } = require("commerce-sdk");

const config: ClientConfig = { /* ... */ };
const shopperStoresClient = new Seller.ShopperStores(config);
```

**Mule App Version:** 1.0.6
