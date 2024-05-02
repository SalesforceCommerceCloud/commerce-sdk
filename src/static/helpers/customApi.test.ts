/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import nock from "nock";
import { callCustomEndpoint } from "./customApi";
import { expect } from "chai";
import sinon from "sinon";
import {
  ClientConfig,
  Response,
  StaticClient,
  CommonParameters,
} from "@commerce-apps/core";
import { CUSTOM_API_DEFAULT_BASE_URI } from "./config";

describe("callCustomEndpoint", () => {
  const runFetchSpy = sinon.spy(StaticClient, "runFetch");

  beforeEach(() => {
    runFetchSpy.resetHistory();
    nock.cleanAll();
  });

  const clientConfig: ClientConfig = {
    parameters: {
      shortCode: "short_code",
      organizationId: "organization_id",
      clientId: "client_id",
      siteId: "site_id",
    },
  };

  const options = {
    method: "POST",
    parameters: {
      queryParam1: "query parameter 1",
      queryParam2: "query parameter 2",
    },
    customApiPathParameters: {
      apiName: "api_name",
      apiVersion: "v2",
      endpointPath: "endpoint_path",
    },
    headers: {
      "Content-Type": "text/plain",
      authorization: "Bearer token",
    },
    body: "Hello World",
  };

  const queryParamString = new URLSearchParams({
    ...options.parameters,
    siteId: clientConfig.parameters?.siteId as string,
  }).toString();

  // helper function that creates a copy of the options object
  // and adds siteId to the parameters object that comes from clientConfig
  const addSiteIdToOptions = (optionsObj: Record<string, unknown>) => ({
    ...optionsObj,
    parameters: {
      ...(optionsObj.parameters as Record<string, unknown>),
      siteId: clientConfig.parameters?.siteId,
    },
  });

  it("throws an error when required path parameters are not passed", async () => {
    const copyOptions = {
      ...options,
      // omit endpointPath
      customApiPathParameters: {
        apiName: "api_name",
      },
    };

    try {
      await callCustomEndpoint({ options: copyOptions, clientConfig });
      expect(true).to.equal(false); // fails if we don't catch an error
    } catch (error) {
      expect(runFetchSpy.callCount).to.equal(0);
      expect(error.toString()).to.equal(
        "Error: Missing required property needed in options.customApiPathParameters or clientConfig.parameters: endpointPath"
      );
    }
  });

  it('sets api version to "v1" if not provided', async () => {
    const copyOptions = {
      ...options,
      // omit apiVersion
      customApiPathParameters: {
        endpointPath: "endpoint_path",
        apiName: "api_name",
      },
    };

    const { shortCode, organizationId } =
      clientConfig.parameters as CommonParameters;
    const { apiName, endpointPath } = copyOptions.customApiPathParameters;

    const nockBasePath = `https://${shortCode}.api.commercecloud.salesforce.com`;
    const nockEndpointPath = `/custom/${apiName}/v1/organizations/${
      organizationId as string
    }/${endpointPath}`;
    nock(nockBasePath).post(nockEndpointPath).query(true).reply(200);

    const response = (await callCustomEndpoint({
      options: copyOptions,
      clientConfig,
      rawResponse: true,
    })) as Response;

    expect(response.status).to.equal(200);

    const runFetchPassedArgs = runFetchSpy.getCall(0).args;
    expect(runFetchSpy.callCount).to.equal(1);
    // commerce-sdk-core expects apiVersion in clientConfig.parameters
    expect(
      runFetchPassedArgs[1]?.client?.clientConfig?.parameters?.apiVersion
    ).to.equal("v1");
  });

  it("runFetch is called with the correct arguments", async () => {
    const { shortCode, organizationId } =
      clientConfig.parameters as CommonParameters;
    const { apiName, endpointPath } = options.customApiPathParameters;

    const nockBasePath = `https://${shortCode}.api.commercecloud.salesforce.com`;
    const nockEndpointPath = `/custom/${apiName}/v2/organizations/${
      organizationId as string
    }/${endpointPath}`;
    nock(nockBasePath).post(nockEndpointPath).query(true).reply(200);

    await callCustomEndpoint({ options, clientConfig, rawResponse: true });

    const runFetchPassedArgs = runFetchSpy.getCall(0).args;

    const expectedPathParms = {
      ...clientConfig.parameters,
      ...options.customApiPathParameters,
    };

    expect(runFetchSpy.callCount).to.equal(1);
    expect(runFetchPassedArgs[0]).to.equal("post");
    expect(runFetchPassedArgs[1].client).to.deep.equal({
      clientConfig: {
        ...clientConfig,
        baseUri: CUSTOM_API_DEFAULT_BASE_URI,
        parameters: expectedPathParms,
      },
    });
    expect(runFetchPassedArgs[1].pathParameters).to.deep.equal(
      expectedPathParms
    );
    expect(runFetchPassedArgs[1].queryParameters).to.deep.equal({
      ...options.parameters,
      siteId: clientConfig.parameters?.siteId,
    });
    expect(runFetchPassedArgs[1].headers).to.deep.equal(options.headers);
    expect(runFetchPassedArgs[1].rawResponse).to.equal(true);
    expect(runFetchPassedArgs[1].body).to.equal(options.body);
  });

  it("uses path params from options and clientConfig, prioritizing options", async () => {
    const copyClientConfig = {
      ...clientConfig,
      // Only shortCode will be used
      parameters: {
        endpointPath: "clientConfig_endpoint_path",
        apiName: "clientConfig_api_name",
        shortCode: "clientconfig_shortcode",
        apiVersion: "v2",
        organizationId: "clientConfig_organizationId",
        siteId: "site_id",
      },
    };

    const copyOptions = {
      ...options,
      // these parameters will be prioritzed
      customApiPathParameters: {
        endpointPath: "customApiPathParameters_endpoint_path",
        apiName: "customApiPathParameters_api_name",
        apiVersion: "v3",
        organizationId: "customApiPathParameters_organizationId",
      },
    };

    // nock interception should be using custom API path parameters from options
    const { apiName, endpointPath, organizationId, apiVersion } =
      copyOptions.customApiPathParameters;
    // except shortcode since we didn't implement it in copyOptions.customApiPathParameters
    const { shortCode } = copyClientConfig.parameters;

    const nockBasePath = `https://${shortCode}.api.commercecloud.salesforce.com`;
    const nockEndpointPath = `/custom/${apiName}/${apiVersion}/organizations/${organizationId}/${endpointPath}`;
    nock(nockBasePath).post(nockEndpointPath).query(true).reply(200);

    await callCustomEndpoint({
      options: copyOptions,
      clientConfig: copyClientConfig,
    });

    const runFetchPassedArgs = runFetchSpy.getCall(0).args;

    const expectedPathParams = {
      ...copyClientConfig.parameters,
      ...copyOptions.customApiPathParameters,
    };

    expect(runFetchSpy.callCount).to.equal(1);
    expect(runFetchPassedArgs[1].pathParameters).to.deep.equal(
      expectedPathParams
    );
    expect(runFetchPassedArgs[1].client.clientConfig.parameters).to.deep.equal(
      expectedPathParams
    );
  });

  it("uses application/json as default content type if not provided", async () => {
    const copyOptions = {
      ...options,
      // exclude Content-Type
      headers: {
        authorization: "Bearer token",
      },
    };

    const { apiName, endpointPath, apiVersion } =
      copyOptions.customApiPathParameters;
    const { shortCode, organizationId } =
      clientConfig.parameters as CommonParameters;

    const expectedJsonHeaders = {
      authorization: "Bearer token",
      "Content-Type": "application/json",
    };

    const nockBasePath = `https://${shortCode}.api.commercecloud.salesforce.com`;
    const nockEndpointPath = `/custom/${apiName}/${apiVersion}/organizations/${
      organizationId as string
    }/${endpointPath}`;
    nock(nockBasePath, {
      reqheaders: expectedJsonHeaders,
    })
      .post(nockEndpointPath)
      .query(true)
      .reply(200);

    await callCustomEndpoint({
      options: copyOptions,
      clientConfig,
    });

    const runFetchPassedArgs = runFetchSpy.getCall(0).args;
    expect(runFetchSpy.callCount).to.equal(1);
    expect(runFetchPassedArgs[1].headers).to.deep.equal(expectedJsonHeaders)
  });
});
