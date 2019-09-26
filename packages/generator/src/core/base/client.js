import fetch from "node-fetch";

export default class {
  constructor(baseUri) {
    this.baseUri = baseUri;
  }

  get(resource) {
    return fetch(`${this.baseUri}${resource}`);
  }
}
