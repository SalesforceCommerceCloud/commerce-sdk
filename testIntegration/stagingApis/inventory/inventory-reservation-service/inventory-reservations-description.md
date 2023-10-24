# API Overview

Inventory Reservation APIs enable you to place, manage, and fulfill reservations using Omnichannel Inventory.

Inventory Reservation APIs can be segregated into the following functional categories.

| Category                | Endpoint Description                                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Reservations Management | API endpoints for creating and editing order reservation data. Reserved amounts affect the quantities that are available to order and fulfill. |

**Note**: Omnichannel Inventory uses the Tenant Group ID in place of the Organization ID. For more information, see [Commerce API Configuration Values](../../guides/commerce-api-configuration-values.md).

## Authentication and Authorization

Clients calling Omnichannel Inventory can be authenticated in one of two ways.

- Authenticate using Account Manager with your B2C Commerce credentials.
- Authenticate using your Salesforce org credentials.

If you are using both B2C Commerce and Salesforce Order Management, you can use either authentication approach. However, we recommend choosing only one to avoid mixing approaches across your integrations.

The different authentication approaches do not impact the purpose or performance of the APIs.

Each authentication approach uses a unique set of scopes.

| Scopes for Account Manager Authentication | Scopes for Salesforce org Authentication |
| ----------------------------------------- | ---------------------------------------- |
| sfcc.inventory.impex-graphs               | sfcc_inventory_impex_graphs              |
| sfcc.inventory.impex-inventory.rw         | sfcc_inventory_impex_inventory_rw        |
| sfcc.inventory.impex-inventory            | sfcc_inventory_impex_inventory           |
| sfcc.inventory.availability               | sfcc_inventory_availability              |
| sfcc.inventory.availability.rw            | sfcc_inventory_availability_rw           |
| sfcc.inventory.reservations               | sfcc_inventory_reservations              |
| sfcc.inventory.reservations.rw            | sfcc_inventory_reservations_rw           |

Calls through the API gateway to Omnichannel Inventory must have a valid OAUTH bearer token. The tenant identifier used by Omnichannel Inventory is supplied in the header of the token.

All request and response body entities are composed in JSON.

## Reservation Management

Use these API endpoints to create and edit order reservation data. Reserved amounts affect the quantities that are available to order and fulfill.

### Reserve Inventory

This endpoint contains data representing a client order in the body of the request. The response body contains the items Omnichannel Inventory was able to reserve, _which may be less than what was requested_.

### Cancel Reservation

Use this endpoint to cancel a reservation request when you have the Reservation ID that was created at the time of the reservation. This is the preferred method for cancellation, and should always be used if the Reservation ID is available. When using the Cancel Reservation endpoint with the Reservation ID, the reservation document is marked as cancelled and OCI adjust the reservation and inventory counts based on the reservation document details.

### Unreserve Quantity

Use this endpoint to unreserve a previously reserved amount with the quantity, SKU, and place identifier (group or location) specified in the body of the request. This endpoint is provided in case you find yourself in any situation where the Reservation ID is unavailable, or if you find it easier to provide the details to unreserve directly (SKU, and Group or Location). The net effect is the same as using the Cancel Reservation endpoint. When performing an Unreserve, the reservation counts are removed from the location or group using the details provided in the call instead of the details in the reservation document.

### Move Reservation Quantity

Use this endpoint to move reservation quantity between a group and location, a location and a group or between 2 locations, with the quantity and place identifiers specified in the body of the request. A Reservation ID is not required for reservation moves. A reservation move between groups and/or locations is determined in an OMS and only requires that a reserved quantity is moved from one group/location to another. It doesn't need to be aware of or alter the initial reservation document.

### Fulfill Quantity

Use this endpoint to fulfill a reservation amount at a location with the SKU, quantity, and place identifier (group or location) specified in the body of the request. Fulfilling a reservation occurs when the client ships an order and needs to ensure the reserved and on-hand amounts are correct. This is an atomic operation to ensure that all values are successfully updated.

### The Reservation Document

- The api consumer creates the reservation document in order to have a reference containing pertinent information associated with the reservation (Reservation ID, SKU, Qty, Location Group or Location).

- The api consumer sends the reservation document to OCI as part of reservation, and to an OMS (SOM or 3rd Party) as part of the order.

- The reservation document is used by OMS to know which Group/Location a reservation was placed against for routing purposes.

- The reservation document is used by OCI/ECOM in the event that the reservation needs to be cancelled with the Cancel endpoint. (The unreserve endpoint can be used as well, which doesn't require the Reservation ID, but does require other pertinent reservation details such as SKU, and Group or Location)

## Group Reservations

Because inventory is only available at locations, group availability reflects the aggregation of all locations in the group. It also includes reservations placed at a group that has not been allocated to a specific location.

### General Lifecycle of a Group Reservation

- Place the group reservation using `reservation-documents`.
- Allocate the reservation to a location in the group using `transfers`.
- Fulfill the reservation at the location using `fulfillments`.

### Example flow:

Assume Group A has Location 1 and Location 2.

Given the following state of the group:

| Place      | On hand | Reserved | ATO |
| ---------- | ------- | -------- | --- |
| Location 1 | 50      | 0        | 50  |
| Location 2 | 50      | 0        | 50  |
| Group A    | 100     | 0        | 50  |

→ Place group reservation of 1

| Place      | On hand | Reserved | ATO |
| ---------- | ------- | -------- | --- |
| Location 1 | 50      | 0        | 50  |
| Location 2 | 50      | 0        | 50  |
| Group A    | 100     | 1        | 49  |

→ Allocate reservation to Location 2

| Place      | On hand | Reserved | ATO |
| ---------- | ------- | -------- | --- |
| Location 1 | 50      | 0        | 50  |
| Location 2 | 50      | 1        | 49  |
| Group A    | 100     | 1        | 49  |

→ Fulfill at Location 2

| Place      | On hand | Reserved | ATO |
| ---------- | ------- | -------- | --- |
| Location 1 | 50      | 0        | 50  |
| Location 2 | 49      | 0        | 49  |
| Group A    | 99      | 0        | 49  |

Group Reservations **DO NOT** affect a location’s reported Available to Order (ATO) quantity. Essentially, group reservations are a promise returned by the group that one or more of its locations can satisfy the requested reservation quantity. It’s possible that a reservation made against a location could fail if Omnichannel Inventory determines it would break any such existing promises.

For example, a location with a reported ATO of 3 can fail with an ‘Insufficient Quantity’ response when a reservation quantity of 3 is made against it. This scenario happens when some or all of the location’s inventory is unavailable due to a promise (group reservation) made at one of its associated groups.

Fortunately, Omnichannel Inventory exhausts all possibilities to accommodate a group reservation before resulting in failure.

As shown in the Group A example above, a group reservation is only reflected at the location level when it's allocated to one or more locations.

### Shared Locations

When groups share locations things get a little more complex. For example, group reservations made at one group could increase the count of reservations at another if they share one or more locations.

Example Scenario:

Assume that Group A has Location 1 and Location 2 and Group B has Location 2 and Location 3.

Thus, Location 2 is **shared**.

Given the following state of the groups:

| Place      | On hand | Reserved | ATO |
| ---------- | ------- | -------- | --- |
| Location 1 | 5       | 0        | 5   |
| Location 2 | 5       | 0        | 5   |
| Group A    | 10      | 0        | 10  |
|            |         |          |     |
| Location 2 | 5       | 0        | 5   |
| Location 3 | 15      | 0        | 15  |
| Group B    | 20      | 0        | 20  |

→ Placing a Group B reservation of 17

| Place      | On hand | Reserved | ATO |
| ---------- | ------- | -------- | --- |
| Location 2 | 5       | 0        | 5   |
| Location 3 | 15      | 0        | 15  |
| Group B    | 20      | 17       | 3   |

→ Will increase Group A's reservation count by 2

| Place      | On hand | Reserved | ATO |
| ---------- | ------- | -------- | --- |
| Location 1 | 5       | 0        | 5   |
| Location 2 | 5       | 0        | 5   |
| Group A    | 10      | 2        | 8   |

As stated previously, group reservations are a promise returned by the group that one or more of its locations can satisfy the requested reservation quantity. When determining that promise, group reservations follow a "least shared location" approach in that they first lock inventory in their locations which are least shared with other groups. Consequently, that's why, when a reservation of a quantity of 17 was made at Group B, 15 of them were locked at Location 3 first, and the remaining 2 at shared Location 2. As a result, Group A increased its reservation count by 2 to reflect the fact that those 2 are promised elsewhere.

## Temporary Reservations

When creating reservations, the **expirationSeconds** value indicates the amount of time (in seconds) a reservation maintains a hold on its inventory before releasing it. This expiration time constitutes an approximate time because there’s typically a delay (up to 60+ seconds, under extreme load) from the specified expiration time and the actual release of inventory reflected in availability counts.

Consequently, we suggest that you use the **expirationSeconds** value as a guarantee of a reservation's eventual release of inventory, in the event the client is unable to cancel the reservation due to unforeseen technical issues. In other words, we encourage you to let the client manage the timely cancellation of reservations rather than relying on a reservation's expiration time to prevent underselling scenarios and optimize the accuracy of real-time availability counts.

## Common Response Codes

The following error codes apply to all API endpoints. See the API documentation for a complete list of the error codes and response bodies that can be expected on each endpoint.

- 401 - The OATH bearer token is not valid for the tenant or is no longer valid. The response body has the details.
- 403 - The tenant is not provisioned in the system.
- 5XX - There was a server error. The response body has the details.
- Unknown - If an Unknown error type is returned, it indicates that an unknown internal error occurred.

## External Reference Identifier

Currently, there are a number of places where a consumer can submit an `ExternalRefId` with their request. This is to allow the consumer to submit user generated data along with their request as a link to other external systems data. For example, if I'm pulling data from an order that has an order ID, I can submit that order ID with my reservation request as the `externalRefId`. Then, if there is a problem with the reservation, there is a way to connect it with the order in the external system that generated the error or problem. This is NOT to be confused with `externalRefId` used in Salesforce Core, or any other services. The usage is exclusive to OCI and is not used anywhere else.

## Correlation-ID
 
In order to facilitate tracking of operations in OCI, customers must populate a header with the name Correlation-ID, which will be passed through the CDN and sent with the request to OCI. This will help trace requests as they move throughout our service.  To be accepted, the correlation-id must be a valid UUIDv2, otherwise, it will be ignored.
 
When a web-request is passed through the CDN, the CDN's x-correlation-id header value (which comes from their ray-id) also comes into play.  In this case, the correlation-id provided will be prepended to the CDN's x-correlation-id and both values will be passed through, separated by a comma.
 
Some services use a header X-Correlation-ID. In the case of OCI, if this header is used, it is overwritten by the CDN with a new value and the initial purpose of the header is defeated. Use the Correlation-ID instead for a consistent result.