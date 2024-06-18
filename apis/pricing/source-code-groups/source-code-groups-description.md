# API Overview

APIs to support the creation, update, deletions and search of source code groups. 

## Authentication & Authorization

The client requesting the source code information must have access to the Source Code resource. The API requests pass a bearer token in the header of the request. The client must first authenticate against Account Manager to log in.

You must include the relevant scope(s) in the client ID used to generate the token. For details, see [Authorization Scopes Catalog.](https://developer.salesforce.com/docs/commerce/commerce-api/guide/auth-z-scope-catalog.html)