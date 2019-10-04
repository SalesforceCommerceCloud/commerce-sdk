interface IResource {
    baseUri: string;
    path: string;
    pathParameters: Array<string>;
    substitutePathParameters(path: string, parameters: Array<string>) :string;
    toString(): string;
}

class Resource implements IResource {

    public baseUri: string;
    public path: string;
    public pathParameters: Array<string>;

    constructor(baseUri: string, path: string, pathParameters: Array<string>) {
        this.baseUri = baseUri;
        this.path = path;
        this.pathParameters = pathParameters;
    }

    substitutePathParameters(path: string, parameters: Array<string>): string {
        return path.replace(/\{([^}]+)\}/g, (entireMatch, param) => {
            if (parameters && param in parameters) {
                return parameters[param];
            }
            throw new Error(
                `Failed to find a value for required path parameter '${param}'`
            );
        });
    }

    toString(): string {
        if (this.baseUri === null || this.baseUri === undefined) {
            throw new Error("baseUri is not set");
        }
        const renderedPath = this.path
            ? this.substitutePathParameters(this.path, this.pathParameters)
            : "";

        return `${this.baseUri}${renderedPath}`;
    }
}

export {Resource};
