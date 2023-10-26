# API Overview

Inventory Availability APIs enable you to get inventory availability and perform inventory updates within Omnichannel Inventory.

Inventory Availability API can be segregated into the following functional categories:

| Category                      | Endpoint Description                                                                                                                                             |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inventory Availability        | API endpoints for getting inventory SKU availability for groups and locations. You can query for multiple SKUs either by a single group or by multiple locations |
| Inventory Updates and Deletes | API endpoints for updating and deleting inventory availability for specific SKUs.                                                                                |
| Deltas                        | API endpoint for reading the stream of changes that have occurred to SKUs in groups or locations.                                                                |

**Note**: Omnichannel Inventory uses the Tenant Group ID in place of the Organization ID. For more information, see [Configuration Values](https://developer.salesforce.com/docs/commerce/commerce-api/guide/commerce-api-configuration-values).

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
| ---                                       | ---                                      |
| sfcc.inventory.impex-inventory.rw         | sfcc_inventory_impex_inventory_rw        |
| sfcc.inventory.impex-inventory            | sfcc_inventory_impex_inventory           |
| sfcc.inventory.availability               | sfcc_inventory_availability              |
| sfcc.inventory.availability.rw            | sfcc_inventory_availability_rw           |
| sfcc.inventory.reservations               | sfcc_inventory_reservations              |
| sfcc.inventory.reservations.rw            | sfcc_inventory_reservations_rw           |

Calls through the API gateway to Omnichannel Inventory must have a valid OAUTH bearer token. The tenant identifier used by Omnichannel Inventory is supplied in the header of the token.
All request and response body entities are composed in JSON.

## Inventory Availability

Use these API endpoints to get inventory SKU availability for groups and locations. You can query multiple SKUs either by a single group or by multiple locations.

### Group Availability

Use this endpoint to retrieve inventory availability for a group identifier and multiple SKUs with the criteria specified as parameters of the URL. A successful response contains the item availability data for the requested group and SKUs

### Location Availability

Use this endpoint to retrieve inventory availability for multiple location identifiers and SKUs with the criteria specified in the body of the request. A successful response contains the item availability data for the requested locations and SKUs

## Inventory Updates and Deletes

Use these API endpoints to update and delete inventory availability for specific SKUs.

### Updates

Use these endpoints to update inventory availability data for a single location or in a batch of locations.

### Single Location

Use this endpoint to update inventory availability for a specific location identifier and SKU. The data to update is supplied in the body of the request.

### Batch of Locations

Use this endpoint to update multiple locations and SKUS. The stream of item availability records is supplied in the body of the request.

### Deletes

The client calls these endpoints to delete inventory availability data. Although the current values are reset, history is maintained.

### Location

Use this endpoint to delete a SKU at a location with the criteria specified as URL parameters.

### Group

Use this endpoint to delete a SKU at a group with the criteria specified as URL parameters.

## Deltas

Use this endpoint to request inventory availability changes by providing a place identifier (for example, group or location) and a token as parameters of the URL. The response contains a stream of inventory availability data with the changes that have occurred since the token was created. Each successful response contains a _new_ token for the next delta call. See the Inventory Impex API for details on how to retrieve the initial delta token from the Inventory Export.

## Futures

Be advised that this API references Future inventory collections as `futures` and `futureStock`. These are the same thing. Also the Inventory Impex API references Future inventory collections as `futures`.

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