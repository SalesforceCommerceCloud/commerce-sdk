import { default as fetch, Response } from "node-fetch";

const MULESOFT_LOGIN = "https://anypoint.mulesoft.com/accounts/login";

export async function getBearer(
  username: string,
  password: string
): Promise<string> {
  const response: Response = await fetch(MULESOFT_LOGIN, {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  });

  if (response.ok) {
    const json = await response.json();
    return json["access_token"];
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
}
