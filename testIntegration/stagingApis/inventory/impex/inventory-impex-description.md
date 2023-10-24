# API Overview

Inventory Impex APIs enable you to manage imports and exports of inventory availability for Omnichannel Inventory (OCI).

The API can be segregated into the following functional categories.

| Category                      | Endpoint Description                                                   |
| ----------------------------- | ---------------------------------------------------------------------- |
| Inventory Imports and Exports | API endpoints for importing and exporting inventory availability data. |

**Note**: Omnichannel Inventory uses the Tenant Group ID in place of the Organization ID. For more information, see [Commerce API Configuration Values](https://developer.salesforce.com/docs/commerce/commerce-api/guide/commerce-api-configuration-values.html).

## Authentication and Authorization

Clients calling Omnichannel Inventory can be authenticated in one of two ways.

- Authenticate using Account Manager with your B2C Commerce credentials.
- Authenticate using your Salesforce org credentials.

If you’re using both B2C Commerce and Salesforce Order Management, you can use either authentication approach. However, we recommend choosing only one to avoid mixing approaches across your integrations.

The different authentication approaches don’t impact the purpose or performance of the APIs.

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

## Availability Inventory Imports and Exports

Use these API endpoints to import and export item availability data and read deltas (changes).

Omnichannel Inventory stores items for each SKU, keeping a tally of the following item availability properties.

| Availability Property  | Description                                                                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `Available to Fulfill` | Inventory that can be fulfilled now (`Quantity on Hand` - `Quantity Reserved`).                                                                |
| `Available to Order`   | Inventory that can be ordered ((`Quantity on Hand` + `Future Inventory`) - `Quantity Reserved`).                                               |
| `Quantity on Hand`     | Inventory available, not counting `Future Inventory` or `Quantity Reserved`.                                                                   |
| `Quantity Reserved`    | Inventory reserved for fulfillment.                                                                                                            |
| `Safety Stock Count`   | Inventory quantity that is intentionally held back and not included in the counts of `Available to Order` or `Available to Fulfill` inventory. |
| `Future Inventory`     | Inventory available for pre-order or backorder only. Inventory isn’t currently available and includes an expected in-stock date.               |

Use the availability-records imports _POST_ endpoint to initiate a load of the inventory availability data into Omnichannel Inventory. The details of the data being imported are included in the body of the _POST_ request.

The resulting response body from the initiate call contains a link to submit the actual import data stream/file. If the file being uploaded into the system is larger than 100 MB, the file _must_ be compressed with gzip.

After the file has been successfully uploaded to the OCI system, the status of the import can be checked by making calls to the availability-records imports status endpoint. When using this endpoint in conjunction with the importId used in the file upload, you can see if the import process has completed yet.

After the file has been successfully processed by OCI, the response body includes a status of _COMPLETED_. Other metrics regarding the import are also included, and can be found in the documentation for the _status_ call.

Also included in the _COMPLETED_ status is the _fullResults href_. Using this URI, you can retrieve the detailed results of the completed import process.

When performing an import for item availability records, the following endpoints should be used in this order:

1.  Initiate the import with a call to the imports _POST_ URI.
    `https://{shortCode}.api.commercecloud.salesforce.com/inventory/impex/v1/organizations/{organizationId}/availability-records/imports`
2.  Use the uploadLink from the response body of step one to upload the data stream/file to OCI using a _POST_ call to the endpoint provided.
    `https://{shortCode}.api.commercecloud.salesforce.com/inventory/impex/v1/organizations/{organizationId}/availability-records/imports/uploadlink/{uploadLinkId}`
3.  After the file has been uploaded into OCI, you can use a _GET_ call to the importStatusLink that was provided in the response body to initiate call (step one) to check on the status of the processing of your import data.
    `https://{shortCode}.api.commercecloud.salesforce.com/inventory/impex/v1/organizations/{organizationId}/availability-records/imports/{importId}/status`
4.  After the status field in the response body returned from step 3 is _COMPLETED_, the import of the availability record data into OCI is complete. The status response includes a _fullResults href_ field that has a URI for retrieving the details about the completed import process. This information is retrieved with a _GET_ call to the provided URI.
    `https://{shortCode}.api.commercecloud.salesforce.com/inventory/impex/v1/organizations/{organizationId}/availability-records/imports/{importId}/file-content`

Following the steps in this order, with the endpoints indicated, allows you to successfully import availability records into OCI.

### Location Inventory Import File Layout

#### Import File Layout - High-Performance

It’s strongly encouraged that all new customer implementations use this import file layout. Existing customer implementations that use the legacy layout should also migrate to using this new layout so that they can capture the performance improvements. This layout combines the **Location Header** and **Location Inventory** _objects_ of the original specification, into 1 entity. The system doesn’t support mixing content of the original layout and the new one. The import file must be composed entirely using the High-Performance Layout or the Legacy Layout.

**Important**: In order to realize the performance improvement, the file must be constructed such that the SKUs are grouped together, as in the following example.

**Note**: The `mode` is assumed to be `UPDATE` since it's currently the only one supported.

`{"recordId":"0a87539d-f3dd-47bc-91c7-9c752e39dbe0","onHand":10,"sku":"sku1","effectiveDate":"2020-04-08T14:05:22.790896-07:00","futures":[{"quantity":1,"expectedDate":"2020-04-18T14:05:22.781-07:00"}],"safetyStockCount":0,"locationId":"wickenburg"}`

`{"recordId":"3127e2ad-748b-459a-917c-78bef741602c","onHand":10,"sku":"sku1","effectiveDate":"2020-04-08T14:05:22.790896-07:00","futures":[{"quantity":1,"expectedDate":"2020-04-18T14:05:22.781-07:00"}],"safetyStockCount":0,"locationId":"prescott"}`

`{"recordId":"b709e7a8-7d4f-4458-be0c-a88f1e594f1d","onHand":10,"sku":"sku2","effectiveDate":"2020-04-08T14:05:22.790896-07:00","futures":[{"quantity":1,"expectedDate":"2020-04-18T14:05:22.781-07:00"}],"safetyStockCount":0,"locationId":"wickenburg"}`

`{"recordId":"b34c99ea-e659-40f7-bcb4-2a3fdc4a80b0","onHand":10,"sku":"sku2","effectiveDate":"2020-04-08T14:05:22.790896-07:00","futures":[{"quantity":1,"expectedDate":"2020-04-18T14:05:22.781-07:00"}],"safetyStockCount":0,"locationId":"prescott"}`

`{"recordId":"4bf7b40b-c965-485c-afa0-cc56a8ea70eb","onHand":10,"sku":"sku3","effectiveDate":"2020-04-08T14:05:22.790896-07:00","futures":[{"quantity":1,"expectedDate":"2020-04-18T14:05:22.781-07:00"}],"safetyStockCount":0,"locationId":"wickenburg"}`

`{"recordId":"539d41b7-5f05-4908-831b-3dd0461794fc","onHand":10,"sku":"sku3","effectiveDate":"2020-04-08T14:05:22.790896-07:00","futures":[{"quantity":1,"expectedDate":"2020-04-18T14:05:22.781-07:00"}],"safetyStockCount":0,"locationId":"prescott"}`

There are no other requirements for indicating that you’re using the High-Performance Layout. The system reads the file and automatically determines how to process it.

For information regarding the field contents, please see the Import Field Definitions section below.

#### Import File Layout - Legacy

**Note**: The system still supports this import file layout, but due to lower performance, we recommend that users migrate away from using this layout. For more details, see the **Import File Layout High Performance** section.

The import data stream specifies inventory availability data by location and the kind of import operation Omnichannel Inventory should perform (for example, `UPDATE`, `DELETE`, or `REPLACE`). The stream consists of 2 types of json entities separated by line feeds: **Location Header** and **Location Inventory.**

For information regarding the field contents, see the **Import Field Definitions** section.

**Important**: The **Location Header** entity has a one-to-many relationship with the **Location Inventory** entity. For each Location Header, one or more Location Inventory entities should follow for the same location. Although placing a Location Header above each Location Inventory entity is allowed, it leads to _significantly slower_ import processing!

`{"location":"wickenburg","mode":"UPDATE"}`

`{"recordId":"0a87539d-f3dd-47bc-91c7-9c752e39dbe0","onHand":10,"sku":"sku1","effectiveDate":"2020-04-08T14:05:22.790896-07:00","futures":[{"quantity":1,"expectedDate":"2020-04-18T14:05:22.781-07:00"}],"safetyStockCount":0}`

`{"recordId":"f4bf981e-321e-42bd-851f-3573a3263ab1","onHand":5,"sku":"sku2","effectiveDate":"2020-04-08T14:05:22.790896-07:00","safetyStockCount":1}`

#### Import Field Definitions

Location Header:

| Field      | Description                                                                    | Required Field |
| ---------- | ------------------------------------------------------------------------------ | -------------- |
| `location` | The physical location where inventory is housed.                               | `TRUE`         |
| `mode`     | The type of system operation to perform. Currently, only `UPDATE` is supported | `TRUE`         |

Location Inventory:

| Field              | Description                                                                                                                                                                                                        | Required Field                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `recordId`         | Unique identifier of inventory record.                                                                                                                                                                             | `TRUE`                                                         |
| `sku`              | Unique item identifier. Cannot contain : \ < > ; % / or spaces, tabs, and line breaks.                                                                                                                             | `TRUE`                                                         |
| `onHand`           | The current quantity on hand.                                                                                                                                                                                      | `FALSE`                                                        |
| `effectiveDate`    | The effective date of the `onHand` (ISO format).                                                                                                                                                                   | `FALSE`, see the additional description below for more detail. |
| `futures`          | A collection of future quantity information for the item. (See Future Quantity, below.) Note: the Inventory Availability API references `futures` in a collection called, `futureStock`. These are the same thing. | `FALSE`, If specified see the required fields below.           |
| `safetyStockCount` | The safety stock count.                                                                                                                                                                                            | `FALSE`                                                        |

Future Quantity:

| Field          | Description                                                                             | Required Field |
| -------------- | --------------------------------------------------------------------------------------- | -------------- |
| `quantity`     | The quantity that will be arriving in the future. **The value must be greater than 0.** | `TRUE`         |
| `expectedDate` | The date the future quantity is expected to arrive (ISO format).                        | `TRUE`         |

The response from the call to submit contains a custom endpoint for checking the status and progress of the import. The status response contains a URI for the full result file for any records that failed to load, if there are any. Omnichannel Inventory also provides endpoints for querying and deleting import jobs.

Availability Effective Date:

The `effectiveDate` field represents the time the `onHand` value was accurate at the physical location. It’s used in conjunction with the reservation fulfillment field, `fulfillmentTime` to keep `onHand` in sync with the physical location. For example, if `effectiveDate` is specified on a location record, the system will optionally decrement the value of `onHand` when a Reservation Fulfillment is made. See the [Inventory Reservation API](https://developer.salesforce.com/docs/commerce/commerce-api/references?meta=inventory-reservation-service:Summary) for more information on how Reservation Fulfillments work.

#Example:

Import happens for SKU: `abc` at location: `123`, and the value of `onHand` accounts for a Reservation Fulfillment that hasn't yet processed in OCI.

Note: The JSON is shown formatted here, however in the actual import file it _must_ all be on a single line.

```
   {
    "recordId":"a26fe1fd-c413-4b74-8570-1ec185ca7192",
    "onHand":10,
    "sku":"abc",
    "effectiveDate":"2021-03-09T00:00:00.000000-07:00"
   }
```

Reservation Fulfillment Request happens after the import for SKU: `abc` at location: `123`

```{
    "records": [
      {
        "id": "82251928-8863-488e-840b-2aebd10b57ba",
        "location": "123",
        "sku": "abc",
        "fulfillmentTime":"2021-03-08T00:00:00.000000-07:00"
        "quantity": 1
      }
    ]
  }
```

The system compares the values of `effectiveDate` and `fulfillmentTime`. Since `fulfillmentTime` is _less_ than `effectiveDate` it does _not_ decrement the value of `onHand`. If the reservation fulfillment happened first, `onHand` would be decremented (assuming the previous value of `effectiveDate` was less than `fulfillmentTime`). Then when the system performed the inventory import, the value of `onHand` would replace the previous value.

### Location Inventory Import Result File Layout

The result file starts with a status line record.

`{"status": "COMPLETED_WITHOUT_ERRORS"}`

| Result Status                     | Description                          |
| --------------------------------- | ------------------------------------ |
| `COMPLETED_WITHOUT_ERRORS`        | Import completed without any errors. |
| `COMPLETED_WITH_PARTIAL_FAILURES` | Some records failed to load.         |
| `FAILED`                          | Failed to load any records.          |

Each line following the status line represents an error record.

`{"recordId": "2a3e769c-c981-4d96-ba6a-e0b821a5bbbb","locationId":"location1","sku": "sku1", "message": "Unknown"}`

| Field        | Description                                                                                       | Required Field |
| ------------ | ------------------------------------------------------------------------------------------------- | -------------- |
| `recordId`   | Unique identifier of inventory record sent in import file.                                        | `TRUE`         |
| `locationId` | Location identifier.                                                                              | `TRUE`         |
| `sku`        | Unique item identifier of an item. Cannot contain : \ < > ; % / or spaces, tabs, and line breaks. | `TRUE`         |
| `message`    | Message containing details for failure.                                                           | `TRUE`         |

## Product Segmentation Import

Use these API endpoints to import product segmentation data. This data allows SKUs to be excluded from a Location Group so customers can remove certain SKUs from a particular selling channel.

Use the product-segmentation imports _POST_ endpoint to initiate a load of the product segmentation data into Omnichannel Inventory. The details of the data being imported are included in the body of the _POST_ request.

The resulting response body from the initiate call contains a link to submit the actual import data stream/file. If the file being uploaded into the system is larger than 100 MB, the file _must_ be compressed with gzip.

After the file has been successfully uploaded to the OCI system, the status of the import can be checked by making calls to the product-segmentation imports status endpoint. When using this endpoint in conjunction with the importId used in the file upload, you can see if the import process has completed yet.

After the file has been successfully processed by OCI, the response body includes a status of _COMPLETED_. Other metrics regarding the import are also included, and can be found in the documentation for the _status_ call.

Also included in the _COMPLETED_ status is the _fullResults href_. Using this URI, you can retrieve the detailed results of the completed import process.

When performing an import for product segmentation data, the following endpoints should be used in this order:

1.  Initiate the import with a call to the imports _POST_ URI.
    `https://{shortCode}.api.commercecloud.salesforce.com/inventory/impex/v1/organizations/{organizationId}/product-segmentation/imports`
2.  Use the uploadLink from the response body of step one to upload the data stream/file to OCI using a _POST_ call to the endpoint provided.
    `https://{shortCode}.api.commercecloud.salesforce.com/inventory/impex/v1/organizations/{organizationId}/product-segmentation/imports/uploadlink/{uploadLinkId}`
3.  After the file has been completely uploaded into OCI, you can use a _GET_ call to the importStatusLink that was provided in the response body to initiate call (step one) to check on the status of the processing of your data.
    `https://{shortCode}.api.commercecloud.salesforce.com/inventory/impex/v1/organizations/{organizationId}/product-segmentation/imports/{importId}/status`
4.  After the status field in the response body returned from step 3 is _COMPLETED_, the import of the product segmentation data into OCI is complete. The status response includes a _fullResults href_ field that has a URI for retrieving the details about the completed import process. This information is retrieved with a _GET_ call to the provided URI.
    `https://{shortCode}.api.commercecloud.salesforce.com/inventory/impex/v1/organizations/{organizationId}/product-segmentation/exports/{exportId}/file-content`

Following the steps in this order, with the endpoints indicated, allows you to successfully import product segmentation records into OCI.

### Product Segmentation Exclusion Import File Layout

The import data stream specifies the group that is affected by the data, as well as the kind of import operation Omnichannel Inventory should perform on the exclusion (for example, `REPLACE`, `APPEND`, or `REMOVE`). The stream consists of 2 types of json entities separated by line feeds: **Group Header** and **SKU Data.**

**Important:** The **Group Header** entity has a 1-to-many relationship with the **SKU Data** entity, in that for each Group Header, one or more SKU Data entities should follow for the same group. Though placing a Group Header above each SKU Data entity is allowed, it leads to **significantly slower** import processing!

`{"groupId":"G1","mode":"REPLACE"}`

`{"sku":"sku1"}`

`{"sku":"sku2"}`

`{"groupId":"G1","mode":"APPEND"}`

`{"sku":"sku37"}`

### Exclusion Import Field Definitions

Group Header:

| Field     | Description                                                                                                                                                                    | Required Field |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| `groupId` | The group that we’re acting upon for setting exclusions.                                                                                                                       | `TRUE`         |
| `mode`    | The type of system operation to perform for the group. `REPLACE` all entries for group, `APPEND` new entries to the group, or `REMOVE` a set of SKUs from the group exclusion. | `TRUE`         |

SKU Data:

| Field | Description                                                                                                                                | Required Field |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| `sku` | The unique item identifier for an item in the group that is to be excluded. Cannot contain : \ < > ; % / or spaces, tabs, and line breaks. | `TRUE`         |

## Product Segmentation Export

The export file is a collection of complete JSON records containing the product segmentation data, one complete entry per line.

Use this endpoint to request a snapshot of the current product segmentation exclusions. You can request a snapshop for a list of groups or all groups by using group "\*". Omnichannel inventory provides another endpoint for checking the status and progress of this operation.

The finished export is retrieved with a link that is supplied in the status check response.  
When retrieving the status for any Export or Import process, the following responses are available.

| Export Status | Description                                                        |
| ------------- | ------------------------------------------------------------------ |
| `STAGING`     | The request is being created.                                      |
| `WAITING`     | For imports - waiting for file upload.                             |
| `EXPIRED`     | Request has expired.                                               |
| `SUBMITTED`   | Request has been submitted for processing - not yet queued.        |
| `PENDING`     | Request is queued for processing - not yet started.                |
| `RUNNING`     | Request is running - not yet complete.                             |
| `COMPLETED`   | Request has finished - results file location included in response. |
| `FAILED`      | Request has failed - resubmit a new request to try again.          |
| `STOPPED`     | Request was stopped - resubmit a new request to try again.         |

### Export Download File Layout

The export file is a collection of complete JSON records, containing one complete element per line.

#### Group Line

`{"groupId":"UnitedStates"}`

| Group Indicator Line | Description                                            |
| -------------------- | ------------------------------------------------------ |
| `groupId`            | The group that the following detail records belong to. |

#### SKU Line

`{"sku":"sku121"}`

| Group Indicator Line | Description                                                                     |
| -------------------- | ------------------------------------------------------------------------------- |
| `sku`                | A sku identifier that is a member of that product segmentation exclusion group. |

## Availability Export

The export file is a collection of complete JSON records containing one complete element per line.

Use this endpoint to request a snapshot of the current inventory availability with the criteria (for example, a single group, all groups, a single location, or all locations) specified in the body of the request. Omnichannel Inventory provides another endpoint for checking the status and progress of the operation.

The finished export is retrieved with a link supplied in the status check response. The exported data contains a delta token for getting changes since the export.

When retrieving the status for any Export or Import process, the following responses are available.

| Export Status | Description                                                        |
| ------------- | ------------------------------------------------------------------ |
| `STAGING`     | The request is being created.                                      |
| `WAITING`     | For imports - waiting for file upload.                             |
| `EXPIRED`     | Request has expired.                                               |
| `SUBMITTED`   | Request has been submitted for processing - not yet queued.        |
| `PENDING`     | Request is queued for processing - not yet started.                |
| `RUNNING`     | Request is running - not yet complete.                             |
| `COMPLETED`   | Request has finished - results file location included in response. |
| `FAILED`      | Request has failed - resubmit a new request to try again.          |
| `STOPPED`     | Request was stopped - resubmit a new request to try again.         |

### Export Download File Layout

The export file is a collection of complete JSON records, containing one complete element per line.

**Note**: The Availability Export only supports exporting either groups or locations, but not both at the same time.

#### Group Line

`{"groupId":"UnitedStates"}`

| Group Indicator Line | Description                                            |
| -------------------- | ------------------------------------------------------ |
| `groupId`            | The group that the following detail records belong to. |

#### Location Line

`{"locationId":"phoenix"}`

| Group Indicator Line | Description                                               |
| -------------------- | --------------------------------------------------------- |
| `locationId`         | The location that the following detail records belong to. |

Item Record Lines - One Complete JSON Entry Per Line:

`{"sku":"123","onHand":10,"reserved":6,"groupReserved":6,"sharedGroupReserved":0,"atf":4,"ato":24,"safetyStockCount":1,"effectiveDate":"2019-07-20T11:04:02Z","futures":[{"quantity":20,"expectedDate":"2019-07-24T21:13:00Z"}]}`

| Field                 | Description                                                                                                                                                                                       | Required Field |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `sku`                 | Unique item identifier. Cannot contain : \ < > ; % / or spaces, tabs, and line breaks.                                                                                                            | `TRUE`         |
| `onHand`              | The current quantity on hand.                                                                                                                                                                     | `TRUE`         |
| `reserved`            | The current quantity reserved.                                                                                                                                                                    | `TRUE`         |
| `atf`                 | The current quantity available to fulfill.                                                                                                                                                        | `TRUE`         |
| `ato`                 | The current quantity available to place on order.                                                                                                                                                 | `TRUE`         |
| `effectiveDate`       | The effective date (ISO format.                                                                                                                                                                   | `FALSE`        |
| `groupReserved`       | The total group reservations for the group NOT including shared. This field is present only for GROUP lines in the export.                                                                        | `FALSE`        |
| `sharedGroupReserved` | The amount of the soft reserved count that comes from other groups. This field is present only for GROUP lines in the export.                                                                     | `FALSE`        |
| `safetyStockCount`    | The safety stock count.                                                                                                                                                                           | `TRUE`         |
| `futures`             | A collection of future quantity information for the item, as described below. The Inventory Availability API references `futures` in a collection called `futureStock`. These are the same thing. | `TRUE`         |

Future Quantity:

| Field          | Description                                                      | Required Field |
| -------------- | ---------------------------------------------------------------- | -------------- |
| `quantity`     | The quantity that will be arriving in the future.                | `TRUE`         |
| `expectedDate` | The date the future quantity is expected to arrive (ISO format). | `TRUE`         |

Delta Token Line:

`{"deltaToken": "dsfljasdflkjasdfkj2381238"}`

The value is used in the call to retrieve deltas. This delta token is valid for 23.5 hours, after which time it expires and a new token must be obtained with another export. See the [Inventory Availability API](https://developer.salesforce.com/docs/commerce/commerce-api/references?meta=inventory-availability:Summary) for additional details.

## Event Log Export

The export file is a collection of complete JSON records containing one complete element per line.

Use this endpoint to request the event log for a SKU within a certain set of locations and groups. Omnichannel Inventory provides another endpoint for checking the status and progress of the operation.

The finished export is retrieved with a link supplied in the status check response.

When retrieving the status for any Export or Import process, the following responses are available.

| Export Status | Description                                                        |
| ------------- | ------------------------------------------------------------------ |
| `STAGING`     | The request is being created.                                      |
| `WAITING`     | For imports - waiting for file upload.                             |
| `EXPIRED`     | Request has expired.                                               |
| `SUBMITTED`   | Request has been submitted for processing - not yet queued.        |
| `PENDING`     | Request is queued for processing - not yet started.                |
| `RUNNING`     | Request is running - not yet complete.                             |
| `COMPLETED`   | Request has finished - results file location included in response. |
| `FAILED`      | Request has failed - resubmit a new request to try again.          |
| `STOPPED`     | Request was stopped - resubmit a new request to try again.         |

### Export Download File Layout

The export file is a collection of complete JSON records, containing one complete element per line.

#### Group Line

`{"groupId":"UnitedStates"}`

| Group Indicator Line | Description                                            |
| -------------------- | ------------------------------------------------------ |
| `groupId`            | The group that the following detail records belong to. |

#### Location Line

`{"locationId":"phoenix"}`

| Group Indicator Line | Description                                               |
| -------------------- | --------------------------------------------------------- |
| `locationId`         | The location that the following detail records belong to. |

Item Record Lines - One Complete JSON Entry Per Line:

`{"locationId":"newbraunfels"}{"eventType":"location_import","location":"newbraunfels","sequenceNumber":0,"quantity":10.0,"newReserved":0.0,`

`"newAto":11.0,"newOnHand":10.0,"newAtf":10.0,"newSoftReserved":0.0,"futureQuantity":1.0,"oldReserved":0.0,`

`"oldAto":0.0,"oldOnHand":0.0,"oldAtf":0.0,"oldSoftReserved":0.0,"createdTime":"2022-01-18T15:58:40.443Z",`

`"effectiveTime":"2020-04-08T14:05:22.795243-07:00","safetyStockCount":0.0}`

| Field              | Description                                                        | Required Field |
| ------------------ | ------------------------------------------------------------------ | -------------- |
| `eventType`        | The event type.                                                    | `TRUE`         |
| `location`         | The location associated with this event.                           | `TRUE`         |
| `sequenceNumber`   | The internal sequence number associated with the event.            | `TRUE`         |
| `quantity`         | The item quantity.                                                 | `TRUE`         |
| `newReserved`      | The new reserved amount for the SKU and location.                  | `TRUE`         |
| `newAto`           | The new ATO for the item.                                          | `TRUE`         |
| `newOnHand`        | The new on hand amount for the item.                               | `TRUE`         |
| `newAtf`           | The new ATF amount for the item.                                   | `TRUE`         |
| `newSoftReserved`  | The new soft reservation amount for the item.                      | `TRUE`         |
| `futureQuantity`   | The future quantity for the item.                                  | `TRUE`         |
| `oldReserved`      | The old reserved amount for the item, before the event took place. | `TRUE`         |
| `oldAto`           | The old ATO for the item, before the event took place.             | `TRUE`         |
| `oldOnHand`        | The old on hand amount for the item, before the event took place.  | `TRUE`         |
| `oldAtf`           | The old ATF amount for the item, before the event took place.      | `TRUE`         |
| `oldSoftReserved`  | The old soft reserved amount, before the event took place.         | `TRUE`         |
| `createdTime`      | The time the event was created.                                    | `TRUE`         |
| `effectiveTime`    | The effective time of the event.                                   | `TRUE`         |
| `safetyStockCount` | The safety stock count value for the item.                         | `TRUE`         |

## Reservations Export

Use this endpoint to request the reservation documents within a certain set of dates and reservation status values. The current supported status values for a reservation are "open" and "closed". Omnichannel Inventory provides endpoints for initiating the export, checking the status and progress of the export, and for downloading the actual export file when it is complete.

The finished export is retrieved with a link supplied in the status check response.

When retrieving the status for any Export or Import process, the following responses are available.

| Export Status | Description                                                        |
| ------------- | ------------------------------------------------------------------ |
| `STAGING`     | The request is being created.                                      |
| `WAITING`     | For imports - waiting for file upload.                             |
| `EXPIRED`     | Request has expired.                                               |
| `SUBMITTED`   | Request has been submitted for processing - not yet queued.        |
| `PENDING`     | Request is queued for processing - not yet started.                |
| `RUNNING`     | Request is running - not yet complete.                             |
| `COMPLETED`   | Request has finished - results file location included in response. |
| `FAILED`      | Request has failed - resubmit a new request to try again.          |
| `STOPPED`     | Request was stopped - resubmit a new request to try again.         |

### Export Download File Layout

The export file is a collection of complete JSON records, containing one reservation record per reservationId.

#### Header Info
{\
&nbsp;&nbsp;&nbsp;&nbsp;"reservationId" : "5baf4a87-1841-4311-9ca9-601e5d32885b",\
&nbsp;&nbsp;&nbsp;&nbsp;"externalRefId" : "OCI-1234567",\
&nbsp;&nbsp;&nbsp;&nbsp;"reservationTime" : 1648718653000,\
&nbsp;&nbsp;&nbsp;&nbsp;"reservationState" : "CLOSED",\
&nbsp;&nbsp;&nbsp;&nbsp;"reservationDetails" : []\
}

| Header Field Info    | Description                                            |
| -------------------- | ------------------------------------------------------ |
| `reservationId`      | The reservationId for the exported reservation.        |
| `externalRefId`      | The external reference identifier for the exported reservation.  This value correlates to a value in an external ordering system        |
| `reservationTime`    | The time that was applied to the reservation when it was placed.        |
| `reservationState`   | The current state of the reservation. Current supported values are "open" and "closed".       |
| `reservationDetails` | An array containing the details of the reservation in question.        |


#### Reservation Details

The reservationDetails field contains an array of info related to the exported reservation

"reservationDetails" : {\
&nbsp;&nbsp;&nbsp;&nbsp;"group": "ACME_US",\
&nbsp;&nbsp;&nbsp;&nbsp;"sku" : "white-shirt-40",\
&nbsp;&nbsp;&nbsp;&nbsp;"quantity" : 5,\
&nbsp;&nbsp;&nbsp;&nbsp;"reservationDetailActions" [] \
}

| Reservation Details Info    | Description                                            |
| --------------------------- | ------------------------------------------------------ |
| `group or location`         | Whether this detail item is associated with a group or a location.        |
| `sku`                       | The SKU identifier associated with this detail line.       |
| `quantity`                  | The quantity applied to the reservation line item.     |
| `reservationDetailActions`  | An array of actions that have taken place for this line item in the reservation. |


#### Reservation Detail Actions

The reservationDetailActions is an array of entries tracking the actions taken on a particular reservation document.
"reservationDetailActions" : [\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "requestId" : "3678-23456-3456-4567-9999-1232",\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "externalRefId" : "1234561-4949-2345",\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "quantity" : 5,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "action" : Reserverd,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; timestamp : "16487200010000"\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}\
&nbsp;&nbsp;&nbsp;&nbsp;]

| Reservation Actions Detail  | Description                                            |
| --------------------------- | ------------------------------------------------------ |
| `requestId`                 | The request ID associated with this reservation action.|
| `externalRefId`             | The external reference identifier for the exported action. This value correlates to a value in an external ordering system. |
| `quantity`                  | The quantity associated with this reservaiton action.  |
| `action`                    | The action that was taken against this line item.      |
| `timestamp`                 | The time that the action was taken.                    |

## Common Response Codes

The following error codes apply to all API endpoints. See the API documentation for a complete list of the error codes and response bodies that can be expected on each endpoint.

- 401 - The OATH bearer token isn’t valid for the tenant or is no longer valid. The response body has the details.
- 403 - The tenant isn’t provisioned in the system.
- 5XX - There was a server error. The response body has the details.
- Unknown - If an Unknown error type is returned, it indicates that an unknown internal error occurred.

## External Reference Identifier

Currently, there are a number of places where a consumer can submit an `ExternalRefId` with their request. This is to allow the consumer to submit user-generated data along with their request as a link to other external systems data. For example, if I'm pulling data from an order that has an order ID, I can submit that order ID with my reservation request as the `externalRefId`. Then, if there is a problem with the reservation, there is a way to connect it with the order in the external system that generated the error or problem. This is NOT to be confused with `externalRefId` used in Salesforce Core, or any other services. The usage is exclusive to OCI and is not used anywhere else.

## Correlation-ID

In order to facilitate tracking of operations in OCI, customers must populate a header with the name Correlation-ID, which will be passed through the CDN and sent with the request to OCI. This will help trace requests as they move throughout our service. To be accepted, the correlation-id must be a valid UUIDv2, otherwise, it will be ignored.

When a web-request is passed through the CDN, the CDN's x-correlation-id header value (which comes from their ray-id) also comes into play. In this case, the correlation-id provided will be prepended to the CDN's x-correlation-id and both values will be passed through, separated by a comma.

Some services use a header X-Correlation-ID. In the case of OCI, if this header is used, it is overwritten by the CDN with a new value and the initial purpose of the header is defeated. Use the Correlation-ID instead for a consistent result.