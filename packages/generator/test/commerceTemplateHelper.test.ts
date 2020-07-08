/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import sinon from "sinon";
import { expect } from "chai";
import { model, amf } from "@commerce-apps/raml-toolkit";
import { error } from "console";

const {
  addNamespacePrefixToType,
  addNamespacePrefixToArray,
  getRequestPayloadTypeWithNamespace
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require("../src/commerceTemplateHelper");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const commerceTemplateHelper = require("../src/templateHelpers");

describe("When getting a Request Payload Type With a Namespace", () => {
  let singleResponse: model.domain.Request;
  let multiResponse: model.domain.Request;

  before(() => {
    amf.AMF.init();
    //Setup response with multiple types
    const arrayPayload = new model.domain.Payload().withSchema(
      new model.domain.ArrayShape()
    );
    const payloads: model.domain.Payload[] = [];
    const payload = new model.domain.Payload();
    payloads.push(arrayPayload);
    multiResponse = new model.domain.Request().withPayloads(payloads);

    //setup response with one type
    singleResponse = new model.domain.Request();
    singleResponse.withPayload();

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

  it("should return the type from a payload prefixed by the namespace", () => {
    expect(getRequestPayloadTypeWithNamespace(singleResponse))
      .to.be.a("string")
      .and.equal("types.Bar1");
  });

  it("should return an array of types which are prefixed by the namespace when there are multiple payloads", () => {
    expect(getRequestPayloadTypeWithNamespace(multiResponse))
      .to.be.a("string")
      .and.equal("Array<types.Foo1 | types.Baa2>");
  });

  it("should return undefined when the request is undefined", () => {
    expect(getRequestPayloadTypeWithNamespace(undefined)).to.be.undefined;
  });

  it("should return undefined when the request is null", () => {
    expect(getRequestPayloadTypeWithNamespace(null)).to.be.undefined;
  });
});

describe("When adding namespaces to individual types", () => {
  it("Should prefix the .types namespace when provided with any string ", () => {
    expect(addNamespacePrefixToType("foo"))
      .to.be.a("string")
      .and.equal("types.foo");
  });

  it("should not prefix void with a namespace", () => {
    expect(addNamespacePrefixToType("void"))
      .to.be.a("string")
      .and.equal("void");
  });

  it("should not prefix object with a namespace", () => {
    expect(addNamespacePrefixToType("object"))
      .to.be.a("string")
      .and.equal("object");
  });

  it("should not prefix Object with a namespace", () => {
    expect(addNamespacePrefixToType("object"))
      .to.be.a("string")
      .and.equal("object");
  });

  it("should return undefined if called with undfined", () => {
    expect(addNamespacePrefixToType(undefined)).to.be.undefined;
  });

  it("should return null if called with null", () => {
    expect(addNamespacePrefixToType(null)).to.be.null;
  });
});

describe("When adding namespaces to elements in an array", () => {
  it("should prefix each element with a namespace", () => {
    expect(addNamespacePrefixToArray("Array<Foo | Baa>"))
      .to.be.a("string")
      .and.equal("Array<types.Foo | types.Baa>");
  });

  it("should correctly parse three elements in an array",()=>{
    expect(addNamespacePrefixToArray("Array<Foo | Baa | Bar>"))
      .to.be.a("string")
      .and.equal("Array<types.Foo | types.Baa | types.Bar>");
  })

  it("should correctly parse no elements in an array",()=>{
    expect(addNamespacePrefixToArray("Array<>"))
      .to.be.a("string")
      .and.equal("Array<>");
  })

  it("should not add a type to an empty array element",()=>{
    expect(addNamespacePrefixToArray("Array<Foo | | Baa>"))
      .to.be.a("string")
      .and.equal("Array<types.Foo | types.Bar>");
  })


  it("should return undefined if called with undfined", () => {
    expect(addNamespacePrefixToArray(undefined)).to.be.undefined;
  });

  it("should return null if called with null", () => {
    expect(addNamespacePrefixToArray(null)).to.be.null;
  });
});
