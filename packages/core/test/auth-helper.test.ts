/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { BaseClient, ResponseError } from "../src/base/client";
import { ShopperToken, stripBearer } from "../src/base/authHelper";

import { expect, default as chai } from "chai";
import chaiAsPromised from "chai-as-promised";

import _ from "lodash";

before(() => {
  chai.should();
  chai.use(chaiAsPromised);
});

describe("Test stripBearer", () => {
  it("stripBearer happy", () => {
    expect(stripBearer("Bearer mytoken")).to.equal("mytoken");
  });

  it("stripBearer already stripped header", () => {
    expect(stripBearer("mytoken")).to.equal("mytoken");
  });

  it("stripBearer empty string", () => {
    expect(stripBearer("")).to.equal("");
  });
});

describe("Test ShopperToken", () => {
  it("ShopperToken happy getAuthToken", () => {
    const token = new ShopperToken(
      "eyJfdiI6IjEiLCJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfdiI6IjEiLCJleHAiOjE1ODA0MjQ0OTIsImlhdCI6MTU4MDQyMjY5MiwiaXNzIjoiZjY2ZjBlNGYtZmE0NC00MWViLTliMzUtODlkZTllZTY3ZTcxIiwic3ViIjoie1wiX3ZcIjpcIjFcIixcImN1c3RvbWVyX2luZm9cIjp7XCJjdXN0b21lcl9pZFwiOlwiYWJWYVVnOWR6Z01nQ0N4bzQ2QWl0RTExZVRcIixcImd1ZXN0XCI6dHJ1ZX19In0.dl8XgldAVo8SGRDrrSAdnbD_tnRnfYwIrohjhsPW78JgTif2kukQqnB74RgKHRx6U5CTBee8ktTVwqnmtguRT-MiwW2pFaEJAwkiJcQIyNU2MeoxuxCWmvsdykJzlHk7npUgHiw865EmbgEhwiCaXxbXaKSnJCcdLdvbxTuppzLF0fW-yzpLi4caFUidewTrFoFBUj7M4UpF2gd0DtJhX2YEJCTn5jA4y-ue4oY7Vcp6Y2NpG_mOX_gOmYm_m7hJzKuY4zU90SGc-GYkbBKfRPK3GthTr0LNXVsknydirpsZDI1hlBjrCxNz689-oguljGqJ-Xee399GaNQvEbdzRqik1cTIZxUkiT_MJQsRmv8T9o54ePyUPfzThGKFeVI43-RoGsk4N6kLozoGuuA2m7ODeAVPG-RXOrJ6OdW5zGdPbCUHLWPdCu-IrbqKIwLJZ3rSJh1dm4lgUDmHRHE_ri7tTV7KAguUAi1vAKucPro"
    );
    expect(token.getAuthToken()).to.equal(
      "eyJfdiI6IjEiLCJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfdiI6IjEiLCJleHAiOjE1ODA0MjQ0OTIsImlhdCI6MTU4MDQyMjY5MiwiaXNzIjoiZjY2ZjBlNGYtZmE0NC00MWViLTliMzUtODlkZTllZTY3ZTcxIiwic3ViIjoie1wiX3ZcIjpcIjFcIixcImN1c3RvbWVyX2luZm9cIjp7XCJjdXN0b21lcl9pZFwiOlwiYWJWYVVnOWR6Z01nQ0N4bzQ2QWl0RTExZVRcIixcImd1ZXN0XCI6dHJ1ZX19In0.dl8XgldAVo8SGRDrrSAdnbD_tnRnfYwIrohjhsPW78JgTif2kukQqnB74RgKHRx6U5CTBee8ktTVwqnmtguRT-MiwW2pFaEJAwkiJcQIyNU2MeoxuxCWmvsdykJzlHk7npUgHiw865EmbgEhwiCaXxbXaKSnJCcdLdvbxTuppzLF0fW-yzpLi4caFUidewTrFoFBUj7M4UpF2gd0DtJhX2YEJCTn5jA4y-ue4oY7Vcp6Y2NpG_mOX_gOmYm_m7hJzKuY4zU90SGc-GYkbBKfRPK3GthTr0LNXVsknydirpsZDI1hlBjrCxNz689-oguljGqJ-Xee399GaNQvEbdzRqik1cTIZxUkiT_MJQsRmv8T9o54ePyUPfzThGKFeVI43-RoGsk4N6kLozoGuuA2m7ODeAVPG-RXOrJ6OdW5zGdPbCUHLWPdCu-IrbqKIwLJZ3rSJh1dm4lgUDmHRHE_ri7tTV7KAguUAi1vAKucPro"
    );
  });

  it("ShopperToken sad", () => {
    const token = new ShopperToken("NOT_A_TOKEN");

    expect(token.getAuthToken()).to.equal("NOT_A_TOKEN");
    expect(token.decodedToken).to.be.null;
  });

  it("ShopperToken getBearer", () => {
    const token = new ShopperToken("NOT_A_TOKEN");

    expect(token.getBearerHeader()).to.equal("Bearer NOT_A_TOKEN");
  });
});
