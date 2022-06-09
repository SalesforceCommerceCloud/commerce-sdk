// /*
//  * Copyright (c) 2022, salesforce.com, inc.
//  * All rights reserved.
//  * SPDX-License-Identifier: BSD-3-Clause
//  * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
//  */

// import type { OperationOptions } from "retry";
// import { Response, ClientConfig } from "@commerce-apps/core";
// import type { RequestInit } from "node-fetch";

// type LoginRequest = {
//   client_id?: string;
//   response_type?: string;
//   redirect_uri: string;
//   state?: string;
//   scope?: string;
//   usid?: string;
//   channel_id: string;
//   code_challenge: string;
// } & { [key: string]: any };

// export type TokenRequest = {
//   refresh_token?: string;
//   code?: string;
//   usid?: string;
//   grant_type: string;
//   redirect_uri?: string;
//   code_verifier?: string;
//   client_id?: string;
// } & { [key: string]: any };

// export type TokenResponse = {
//   access_token: string;
//   id_token: string;
//   refresh_token: string;
//   expires_in: number;
//   token_type: string;
//   usid: string;
//   customer_id: string;
//   enc_user_id: string;
// } & { [key: string]: any };

// // prefix interface with I
// export interface ISlasClient {
//   authenticateCustomer(
//     options: {
//       parameters?: {
//         organizationId?: string;
//       };
//       retrySettings?: OperationOptions;
//       headers?: { [key: string]: string };
//       fetchOptions?: RequestInit;
//       body: LoginRequest;
//     },
//     rawResponse?: boolean
//   ): Promise<Response | void>;
//   authorizeCustomer(
//     options?: {
//       parameters?: {
//         organizationId?: string;
//         redirect_uri: string;
//         response_type: string;
//         client_id: string;
//         scope?: string;
//         state?: string;
//         usid?: string;
//         hint?: string;
//         channel_id?: string;
//         code_challenge: string;
//       };
//       retrySettings?: OperationOptions;
//       fetchOptions?: RequestInit;
//       headers?: { [key: string]: string };
//     },
//     rawResponse?: boolean
//   ): Promise<Response | void>;

//   getAccessToken(
//     options: {
//       parameters?: {
//         organizationId?: string;
//       };
//       retrySettings?: OperationOptions;
//       fetchOptions?: RequestInit;
//       headers?: { [key: string]: string };
//       body: TokenRequest;
//     },
//     rawResponse?: boolean
//   ): Promise<Response | TokenResponse>;
//   logoutCustomer(
//     options?: {
//       parameters?: {
//         organizationId?: string;
//         client_id: string;
//         refresh_token: string;
//         channel_id?: string;
//       };
//       retrySettings?: OperationOptions;
//       fetchOptions?: RequestInit;
//       headers?: { [key: string]: string };
//     },
//     rawResponse?: boolean
//   ): Promise<Response | TokenResponse>;

//   clientConfig: ClientConfig;
// }
