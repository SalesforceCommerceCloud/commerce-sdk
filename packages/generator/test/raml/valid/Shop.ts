import { StaticClient, BaseClient, ClientConfig, ResponseError, AuthSchemes } from "@commerce-sdk/core";

import {
        product_search_result,
        ClassA,
        customer_product_list_item,
        query,
        ClassB,
        search_request,
        password_change_request,
        sort,
        result_page,
} from "./Shop.types";


export class Client extends BaseClient {
  constructor(config: ClientConfig) {
    super(config);

    if (!!!config.baseUri) {
      config.baseUri = "";
    }
  }

          /**
          * Access site information, like site status and site content URLs.
          */
          getSite(
            parameters?: {
              headers?: { [key: string]: string }
            }
          ): Promise<object> {
    
            const pathParameters = {
            };
    
            const queryParameters = {
            }
    
        // @ts-ignore
        return StaticClient.get({
              client: this,
              path: "/site",
              pathParameters: pathParameters,
              queryParameters: queryParameters,
              headers: (parameters || {}).headers
          });
        }
    
          /**
          * Delete site information.
          */
          deleteSite(
            parameters?: {
              headers?: { [key: string]: string }
            }
          ): Promise<object> {
    
            const pathParameters = {
            };
    
            const queryParameters = {
            }
    
        // @ts-ignore
        return StaticClient.delete({
              client: this,
              path: "/site",
              pathParameters: pathParameters,
              queryParameters: queryParameters,
              headers: (parameters || {}).headers
          });
        }
    
          /**
          * &quot;Searches for products.\n\n The query attribute specifies a complex query that can be used to narrow down the search. Attributes are grouped\n into different buckets.  These are the list of searchable attributes with their corresponding buckets:\n\n Main:\n \n    id - String\n    name - String\n    online - SiteSpecific Boolean\n    searchable - SiteSpecific Boolean \n    valid_from - SiteSpefic DateTime \n    valid_to - SiteSpecfic DateTime \n    type - ProductType \n    creation_date - DateTime\n \n Catalog:\n \n    catalog_id - String\n \n Category:\n \n    category_id - String\n \n Special:\n \n    type - {\&quot;item\&quot;, \&quot;set, \&quot;bundle\&quot;, \&quot;master\&quot;, \&quot;part_of_product_set\&quot;, \&quot;bundled\&quot;, \&quot;variant\&quot;, \&quot;variation_group\&quot;, \&quot;option\&quot;, \&quot;retail_set\&quot;, \&quot;part_of_retail_set\&quot;}\n \n\n The sortable properties are:\n \n id - String\n name - String\n creation_date - DateTime\n \n\n Note that catalog_id is the id of the catalog to which products are assigned to.\n\n Only attributes in the same bucket can be joined using a disjunction (OR).\n For instance, when joining id and catalog_id above, only a conjunction is allowed (AND), whereas id\n and searchable can be joined using a disjunction because they are in the same bucket.  If an attribute\n is used in a disjunction (OR) that violates this rule, an exception will be thrown.\n\n The product search retrieves additional properties of the product when expansions are used.\n\tThe available expand attribute values are:\n \n        \t&#x27;all&#x27; will retrieve all the product properties.\n          &#x27;availability&#x27; will retrieve the following properties:\n            ats\n            in_stock\n            online\n\t\t    \n          &#x27;categories&#x27; will retrieve the following properties:\n            assigned_categories\n\t\t\t\n          &#x27;images&#x27; will retrieve the following properties:\n            image\n\t\t\t\n\t\t\t&#x27;all_images&#x27; used with images will retrieve the following properties:\n            image\n            image_groups\n\t\t\t\n          &#x27;prices&#x27; will retrieve the following properties:\n            price\n            price_currency\n\t\t\t\n          &#x27;sets&#x27; will retrieve the following properties:\n            set_products\n            product_sets\n\t\t\t\n          &#x27;bundles&#x27; will retrieve the following properties:\n            product_bundles\n            bundled_products\n            \n\t\t\t\n\n &quot;
    
          */
          searchProducts(
            parameters: {
              siteId?: any
              headers?: { [key: string]: string }
            }, body: search_request
          ): Promise<product_search_result> {
    
            const pathParameters = {
            };
    
            const queryParameters = {
          "siteId": parameters["siteId"]
            }
    
        // @ts-ignore
        return StaticClient.post({
              client: this,
              path: "/product-search",
              pathParameters: pathParameters,
              queryParameters: queryParameters,
              headers: (parameters || {}).headers, body: body
          });
        }
    
          /**
          * Updates the customer&#x27;s password.
          */
          updateCustomerPassword(
            parameters: {
              headers?: { [key: string]: string }
            }, body: password_change_request
          ): Promise<object> {
    
            const pathParameters = {
            };
    
            const queryParameters = {
            }
    
        // @ts-ignore
        return StaticClient.put({
              client: this,
              path: "/password",
              pathParameters: pathParameters,
              queryParameters: queryParameters,
              headers: (parameters || {}).headers, body: body
          });
        }
    
          /**
          * Updates an item of a customer&#x27;s product list.
      Considered values from the request body are:
    
      priority: This is the priority of the customer&#x27;s product list item.
      public: This is the flag whether the customer&#x27;s product list item is public.
      quantity: used for product item type only. This is the quantity of
      the customer&#x27;s product list item.
      custom properties in the form c_&lt;CUSTOM_NAME&gt;: the custom property
      must correspond to a custom attribute (&lt;CUSTOM_NAME&gt;) defined for ProductListItem.
      The value of this property must be valid for the type of custom attribute defined for ProductListItem.
          */
          updateCustomerProductListItem(
            parameters: {
              itemId: any
              headers?: { [key: string]: string }
            }, body: object
          ): Promise<customer_product_list_item> {
    
            const pathParameters = {
          "itemId": parameters["itemId"]
            };
    
            const queryParameters = {
            }
    
        // @ts-ignore
        return StaticClient.patch({
              client: this,
              path: "/patch/{itemId}",
              pathParameters: pathParameters,
              queryParameters: queryParameters,
              headers: (parameters || {}).headers, body: body
          });
        }
    

}

export default Client;
export { ClientConfig };
