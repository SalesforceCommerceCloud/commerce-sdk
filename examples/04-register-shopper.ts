/*
* Copyright (c) 2022, salesforce.com, inc.
* All rights reserved.
* SPDX-License-Identifier: BSD-3-Clause
* For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
*/

/**
 * Example on how to register a shopper
 * Usage: ts-node examples/04-register-shopper.ts
 * For more information, see (Shopper Customers)[https://developer.salesforce.com/docs/commerce/commerce-api/references?meta=shopper-customers:registerCustomer].
 */
import * as CommerceSdk from "commerce-sdk";
const { helpers, Customer } = CommerceSdk;
 
// demo client credentials, if you have access to your own please replace them below.
const CLIENT_ID = "1d763261-6522-4913-9d52-5d947d3b94c4";
const ORG_ID = "f_ecom_zzte_053";
const SHORT_CODE = "kv7kzm78";
const SITE_ID = "RefArch";

// client configuration parameters
const clientConfig = {
    parameters: {
        clientId: CLIENT_ID,
        organizationId: ORG_ID,
        shortCode: SHORT_CODE,
        siteId: SITE_ID,
    },
};

// must be registered in SLAS. On server, redirectURI is never called
const redirectURI = 'http://localhost:3000/callback';

const slasClient = new Customer.ShopperLogin(clientConfig);

// NOTE: this example uses a public client. If you'd like to register a shopper with a private client,
// use helpers.loginGuestUserPrivate instead. Example on usage can be found in 06-slas-helper-private.ts
const guestTokenResponse = await helpers
    .loginGuestUser(slasClient, { redirectURI })
    .catch((error) =>
        console.log("Error fetching token for guest login: ", error)
    );

const client = new Customer.ShopperCustomers(clientConfig);
 
const options = {
    headers: {
        Authorization: `Bearer ${guestTokenResponse.access_token}`
    },
    parameters: {
        siteId: clientConfig.parameters.siteId
    },
    body: {
        // TODO: Fill in with shopper credentials
        password: "<insert_password>",
        customer: {
          login: "<insert_login>",
          email: "<insert_email>",
          firstName: "<insert_first_name>",
          lastName: "<insert_last_name>"
        }
    }
}

const shopper = await client.registerCustomer(options)
    .catch((error) =>
        console.log("Error registering shopper: ", error)
    );

console.log("Registerered Shopper: ", shopper);
