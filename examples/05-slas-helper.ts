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
 * Usage: ts-node examples/05-slas-helper.ts
 * For more information, see (Shopper Login and API Access Service)[https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas-public-client.html].
 */
import * as CommerceSdk from "commerce-sdk";
const { slasHelpers, Customer } = CommerceSdk;

// demo client credentials, if you have access to your own please replace them below.
const CLIENT_ID = "1d763261-6522-4913-9d52-5d947d3b94c4";
const ORG_ID = "f_ecom_zzte_053";
const SHORT_CODE = "kv7kzm78";
const SITE_ID = "RefArch";

// TODO: Fill in with shopper credentials. Examples on how to register a shopper can be found in 04-register-shopper.ts
const shopper = {
  username: "<insert_username>",
  password: "<insert_password>", // do not store password as plaintext. Store it in a secure location.
};

// must be registered in SLAS. On server, redirectURI is never called
const redirectURI = "http://localhost:3000/callback";

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
const guestTokenResponse = await slasHelpers
  .loginGuestUser(slasClient, { redirectURI })
  .then((guestTokenResponse) => {
    console.log("Guest Token Response: ", guestTokenResponse);
    return guestTokenResponse;
  })
  .catch((error) =>
    console.log("Error fetching token for guest login: ", error)
  );

// REGISTERED B2C USER LOGIN
slasHelpers
  .loginRegisteredUserB2C(
    slasClient,
    { username: shopper.username, password: shopper.password },
    { redirectURI }
  )
  .then((registeredUserTokenResponse) => {
    console.log(
      "Registered User Token Response: ",
      registeredUserTokenResponse
    );
    return registeredUserTokenResponse;
  })
  .catch((error) =>
    console.log("Error fetching token for registered user login: ", error)
  );

// REFRESH TOKEN
const refreshTokenResponse = await slasHelpers
  .refreshAccessToken(slasClient, {
    refreshToken: guestTokenResponse.refresh_token,
  })
  .then((refreshTokenResponse) => {
    console.log("Refresh Token Response: ", refreshTokenResponse);
    return refreshTokenResponse;
  })
  .catch((error) => console.log("Error refreshing token: ", error));

// LOGOUT
slasHelpers
  .logout(slasClient, {
    accessToken: refreshTokenResponse.access_token,
    refreshToken: refreshTokenResponse.refresh_token,
  })
  .then((logoutTokenResponse) => {
    console.log("Logout Token Response: ", logoutTokenResponse);
    return logoutTokenResponse;
  })
  .catch((error) => console.log("Error with logout: ", error));
