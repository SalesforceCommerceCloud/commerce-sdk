/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import sinon from "sinon";
import { expect } from "chai";
import { model, amf } from "@commerce-apps/raml-toolkit";

const {
  getRequestPayloadTypeWithNamespace
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require("../src/commerceTemplateHelper");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const commerceTemplateHelper = require("../src/templateHelpers");

describe("Test retreval of types with namespace prefixes", () => {
  let singleResponse: model.domain.Request;
  let multiResponse: model.domain.Request;

  before(() => {
    amf.AMF.init();
    console.log("arrayPayload");
    //Setup response with multiple types
    const arrayPayload = new model.domain.Payload().withSchema(
      new model.domain.ArrayShape()
    );
    const payloads: model.domain.Payload[] = [];
    const payload = new model.domain.Payload();
    payloads.push(arrayPayload);
    multiResponse = new model.domain.Request().withPayloads(payloads);

    //setup response with one type

    console.log("singleResponse");
    singleResponse = new model.domain.Request();

    console.log("payload");

    singleResponse.withPayload();

    console.log("getRequestPayloadTypeStub");
    //setup stub
    sinon
      .stub(commerceTemplateHelper, "getRequestPayloadType")
      .withArgs(multiResponse)
      .returns("Array<Foo1 | Baa2>")
      .withArgs(singleResponse)
      .returns("Bar1");
  });

  after(() => {
    sinon.restore();
  });

  it("Single request payload type returns success", () => {
    console.log("expect");

    expect(getRequestPayloadTypeWithNamespace(singleResponse))
      .to.be.a("string")
      .and.equal("types.Bar1");
  });

  it("Multiple request payload type returns success", () => {
    console.log("expect");

    expect(getRequestPayloadTypeWithNamespace(multiResponse))
      .to.be.a("string")
      .and.equal("Array<types.Foo1 | types.Baa2>");
  });
});
