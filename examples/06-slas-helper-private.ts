/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Examples on how to use the SLAS helpers using a private client:
 *  - Get authorization token for a guest user
 *  - Get authorization token for a registered user
 *  - Get a new auth token using refresh token
 * Usage: ts-node examples/06-slas-helper-private.ts
 * For more information, see (Shopper Login and API Access Service)[https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas-private-client.html].
 */
import * as CommerceSdk from "commerce-sdk";
const { slasHelpers, Customer } = CommerceSdk;

// demo client credentials, if you have access to your own please replace them below.
// do not store client secret as plaintext. Store it in a secure location.
const CLIENT_ID = "da422690-7800-41d1-8ee4-3ce983961078";
const CLIENT_SECRET = "D*HHUrgO2%qADp2JTIUi";
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
  .loginGuestUserPrivate(slasClient, { clientSecret: CLIENT_SECRET })
  .then((guestTokenResponse) => {
    console.log("Guest Token Response: ", guestTokenResponse);
    return guestTokenResponse;
  })
  .catch((error) =>
    console.log("Error fetching token for guest login: ", error)
  );

// REGISTERED B2C USER LOGIN
slasHelpers
  .loginRegisteredUserB2Cprivate(
    slasClient,
    {
      username: shopper.username,
      password: shopper.password,
      clientSecret: CLIENT_SECRET,
    },
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
slasHelpers
  .refreshAccessTokenPrivate(
    slasClient,
    { clientSecret: CLIENT_SECRET },
    { refreshToken: guestTokenResponse.refresh_token }
  )
  .then((refreshTokenResponse) => {
    console.log("Refresh Token Response: ", refreshTokenResponse);
    return refreshTokenResponse;
  })
  .catch((error) => console.log("Error refreshing token: ", error));
