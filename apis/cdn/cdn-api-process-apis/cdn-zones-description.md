# API Overview

The Content Delivery Network (CDN) API is for managing the embedded CDN (eCDN) that is included with Commerce Cloud and configured with Business Manager.

Use the API to:

- Ensure that traffic doesn’t circumvent proxies layered in front of your eCDN.
- Accelerate the delivery of resources to users with caching, compression, and prioritization.
- Customize how users interact with resources and how requests are processed, including custom pages and routing rules.
- Provide proactive and complete application protection against new and existing exploits from bad actors.

## Access

For resource access, you must use a client ID and client secret from Account Manager to request an access token. The access token is used as a bearer token and added to the `Authorization` header of your API request.

The API client must also have at least one of the following OAuth scopes: `sfcc.cdn-zones` or `sfcc.cdn-zones.rw`.

For detailed setup instructions, see the [Authorization for Admin APIs](https://developer.salesforce.com/docs/commerce/commerce-api/guide/authorization-for-admin-apis.html) guide.
