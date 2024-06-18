# API Overview

The Gift Certificates API lets you create, update, and delete gift certificates, and let your storefront customers purchase and redeem gift certificates.

## Authentication & Authorization

The client requesting the gift certificate information must have access to the Gift Certificates resource. The API requests pass a bearer token in the header of the request. The client must first authenticate against Account Manager to log in.

For details, see [Authorization Scopes Catalog.](https://developer.salesforce.com/docs/commerce/commerce-api/guide/auth-z-scope-catalog.html)

## Use Cases

### Capture All Gift Certificates

Use the Gift Certificates API to retrieve all gift certificates, with no filtering, under a site.

### Capture Specific Gift Certificates

Use the Gift Certificates API to retrieve a specific gift certificate, using merchant ID, for a site.

### Create Site Specific Gift Certificates

Use the Gift Certificates API to create and issue site specific gift certificate using information such as amount, description, status, recipient email, recipient name, sender name, etc.

### Update Gift Certificates

Use the Gift Certificates API to update a gift certificate, with the specified information, using merchant ID.
