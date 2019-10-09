import qs from "qs";

interface IResource {
  baseUri: string;
  path: string;
  pathParameters: object;
  queryParameters: object;
  substitutePathParameters(path: string, parameters: object): string;
  toString(): string;
}

export default class Resource implements IResource {
  public baseUri: string;
  public path: string;
  public pathParameters: object;
  public queryParameters: object;

  constructor(
    baseUri?: string,
    path?: string,
    pathParameters?: object,
    queryParameters?: object
  ) {
    this.baseUri = baseUri;
    this.path = path;
    this.pathParameters = pathParameters;
    this.queryParameters = queryParameters;
  }

  substitutePathParameters(path: string, parameters: object): string {
    return path.replace(/\{([^}]+)\}/g, (entireMatch, param) => {
      if (parameters && param in parameters) {
        return parameters[param];
      }
      throw new Error(
        `Failed to find a value for required path parameter '${param}'`
      );
    });
  }
  renderedPath = this.path
    ? this.substitutePathParameters(this.path, this.pathParameters)
    : "";

  toString(): string {
    if (this.baseUri === null || this.baseUri === undefined) {
      throw new Error("baseUri is not set");
    }
    const renderedPath = this.path
      ? this.substitutePathParameters(this.path, this.pathParameters)
      : "";
    const queryString = qs.stringify(this.queryParameters);

    return `${this.baseUri}${renderedPath}${
      queryString ? "?" : ""
    }${queryString}`;
  }
}

export { Resource };
