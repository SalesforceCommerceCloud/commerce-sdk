import { default as fetch, Response } from "node-fetch";

const MULESOFT_LOGIN = "https://anypoint.mulesoft.com/accounts/login";

export function getBearer(username: string, password: string): Promise<string> {
  return fetch(MULESOFT_LOGIN, {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  }).then((response: Response) => {
    if (response.ok) {
      return response.json().then(json => json["access_token"]);
    }

    switch (response.status) {
      case 401: {
        throw new Error("Invalid username/password");
      }
      default: {
        throw new Error(
          `Unknown Error ${response.status}: ${response.statusText}`
        );
      }
    }
  });
}
