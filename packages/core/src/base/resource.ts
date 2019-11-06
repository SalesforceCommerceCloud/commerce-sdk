import qs from "qs";

export class Resource {
  constructor(
    private baseUri: string,
    private path?: string,
    private pathParameters?: object,
    private queryParameters?: object
  ) {}

  substitutePathParameters(path: string, parameters: object): string {
    return path.replace(/\{([^}]+)\}/g, (_entireMatch, param) => {
      if (parameters && param in parameters) {
        return parameters[param];
      }
      throw new Error(
        `Failed to find a value for required path parameter '${param}'`
      );
    });
  }
  renderedPath = this.path
    ? this.substitutePathParameters(
        this.path as string,
        this.pathParameters as object
      )
    : "";

  toString(): string {
    const renderedPath = this.path
      ? this.substitutePathParameters(
          this.path as string,
          this.pathParameters as object
        )
      : "";
    const queryString = qs.stringify(this.queryParameters);

    return `${this.baseUri}${renderedPath}${
      queryString ? "?" : ""
    }${queryString}`;
  }
}
