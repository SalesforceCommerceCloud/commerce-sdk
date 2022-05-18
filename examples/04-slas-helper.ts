/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Examples on how to use the SLAS helpers using a public client:
 *  - Get authorization token for a guest user
 *  - Get authorization token for a registered user
 *  - Get a new authorization token using refresh token
 *  - Logout
 * Usage: ts-node examples/04-slas-helper.ts
 * For more information, see (Shopper Login and API Access Service)[https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas-public-client.html].
 */
import * as CommerceSdk from "commerce-sdk";
const { helpers, Customer } = CommerceSdk;

// demo client credentials, if you have access to your own please replace them below.
const CLIENT_ID = "1d763261-6522-4913-9d52-5d947d3b94c4";
const ORG_ID = "f_ecom_zzte_053";
const SHORT_CODE = "kv7kzm78";
const SITE_ID = "RefArch";

// demo shopper, if you replaced client credentials above please replace username/password below
const shopper = {
    password: "", // TODO: add demo shopper
    username: "",
}

// must be registered in SLAS. On server, redirectURI is never called
const redirectURI = 'http://localhost:3000/callback';

// client configuration parameters
const clientConfig = {
    parameters: {
        clientId: CLIENT_ID,
        organizationId: ORG_ID,
        shortCode: SHORT_CODE,
        siteId: SITE_ID,
    },
};

const slasClient = new Customer.ShopperLogin(clientConfig);

// GUEST LOGIN
const guestTokenResponse = await helpers.loginGuestUser(
    slasClient, 
    { redirectURI }
).catch(error => console.log("Error fetching token for guest login: ", error));

// REGISTERED B2C USER LOGIN
const registeredUserTokenResponse = await helpers.loginRegisteredUserB2C(
    slasClient,
    { username: shopper.username, password: shopper.password },
    { redirectURI }
).catch(error => console.log("Error fetching token for registered user login: ", error));

// REFRESH TOKEN
const refreshTokenResponse = await helpers.refreshAccessToken(
    slasClient, 
    { refreshToken: registeredUserTokenResponse.refresh_token }
).catch(error => console.log("Error refreshing token: ", error));
  
 // LOGOUT
const logoutTokenResponse = await helpers.logout(slasClient, {
    accessToken: refreshTokenResponse.access_token,
    refreshToken: refreshTokenResponse.refresh_token,
}).catch(error => console.log('Error with logout: ', error));
 
console.log("Guest Token Response: ", guestTokenResponse);
console.log("Registered User Token Response: ", registeredUserTokenResponse);
console.log("Refresh Token Response: ", refreshTokenResponse);
console.log('Logout Token Response: ', logoutTokenResponse);
 