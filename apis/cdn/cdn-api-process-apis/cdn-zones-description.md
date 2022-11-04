# Content Delivery Network Overview

The Content Delivery Network (CDN) API is part of the greater Commerce Cloud embedded CDN (eCDN) that you configure in Business Manager. This API provides the following methods and techniques for end users to use.

-   Ensure that traffic does not circumvent expensive proxies layered in front of your eCDN.
-   Accelerate resources for delivery to end users, enhancing speed of delivery, for example, caching, compression, or prioritization.
-   Customize how end users interact with resources and how requests are processed, for example, custom pages or routing rules.
-   Provide proactive and complete application protection against new and existing exploits from bad actors.

The initial release of the CDN API supports the Content Delivery domain, and focuses on security improvements. Over time, Salesforce expects the CDN API to support other features, many of which we currently provide in the Business Manager eCDN.

Using the CDN API, Salesforce can provide an ever-expanding platform of features that you can use to create and customize your eCDN. In addition, using an API first methodology, the CDN API enables more rapid, innovative feature deployment. As features are exposed, adopted, and deemed necessary across a wider customer base, Salesforce can migrate functionality to Business Manager.

## Authentication and Authorization

To properly authenticate the CDN API, you must use the Client ID and Client Secret from Account Manager to generate an access token. Then you manually add that token to your request.

## Before You Begin

Before you can use any API investigation tool, you must have Account Manager properly configured first.

1.  Create a Client ID in Account Manager.
    For more information, see [Add an API Client ID](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/account_manager/b2c_account_manager_add_api_client_id.html) in the Salesforce B2C Commerce Infocenter.
2.  Assign the new Commerce API role to the API Client ID.
    a. In Roles, click **Add**.
    b. Select Salesforce Commerce API, and click Add.
    ![add_api_client-561c3f12-ed1f-4745-82ea-946e55eec2bb.png](https://resources.docs.salesforce.com/rel1/doc/en-us/static/misc/add_api_client-561c3f12-ed1f-4745-82ea-946e55eec2bb.png)
3.  Specify the Commerce API Role Scope.
    a. Click the filter icon.
    b. In the Add Instance Filters tab, select an organization.
    c. Select the instance that you want the API Client ID to be used for, and click **Add**.
    **Note:** When you use the ClientID to request an access token, you must specify the specific instance you want the access token for. This instance must be specified, otherwise an access token is not provided.
4.  Assign scopes to the Client ID.
    In the ‘Allowed Scopes’ field, enter all scopes that you need for the client ID to work for your respective use cases.
    ![cdn_scopes-4d6bbfb8-e32e-439c-8ad2-8c5d2d58ce9a.png](https://resources.docs.salesforce.com/rel1/doc/en-us/static/misc/cdn_scopes-4d6bbfb8-e32e-439c-8ad2-8c5d2d58ce9a.png)
5.  Select **client_secret_post** as the Endpoint Auth method.
    This method must be selected since requesting an access token is done by authenticating the client with a clientID and its related secret.
6.  Select **JWT** as the Access Token Format, as this is the only format we support with the new client AuthZ.

## Obtain an Access Token

An access token is required to make calls to the CDN Zones API. The following diagram shows the authorization code grant flow using OAuth 2.0 that is necessary for obtaining an access token from Account Manager.

After generating an access token, you can use the `access_token` value to access the CDN API.

![auth_sequence_new-191758e2-dc03-493c-ab24-488c65325d35.png](https://resources.docs.salesforce.com/rel1/doc/en-us/static/misc/auth_sequence_new-191758e2-dc03-493c-ab24-488c65325d35.png)

### Authorization Flow

Launch the OAuth 2.0 client to initiate the access token request.

The Client makes a call to the `access_token` endpoint to generate the access token. 

This is an example of a request using `curl` to generate the token using the `client_secret` `POST` method:

```
curl -i -k \
--data 'grant_type=client_credentials&scope=SALESFORCE_COMMERCE_API:<tenantID> sfcc.cdn-zones' \
--user '<client-id>:<client-secret>' \
-X POST 'https://account.demandware.com/dwsso/oauth2/access_token'
```

Account Manager responds with an access token.

**Note:** Sometimes Account Manager also responds with a refresh token.

After obtaining an access token from Account Manager, you can use the token to make calls to the CDN API.
