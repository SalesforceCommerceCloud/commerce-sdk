# API Overview

The Assignments API enables you to search for promotions associated with campaigns.

For more information, see [Campaigns and Promotions](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/Promotions/CampaignsandPromotions.html) in the Salesforce B2C Commerce Infocenter.

## Authentication & Authorization

The client requesting the promotion information must have access to the Promotion resource. The API requests pass a bearer token in the header of the request. The client must first authenticate against Account Manager to log in.

## Use Cases

### Find All Associated Promotions

Use the Assignments API to find all associated promotions for a given campaign. 

## Resources

### PromotionCampaignAssignmentSearchResult

Details of the Campaign and Promotion assignments. 