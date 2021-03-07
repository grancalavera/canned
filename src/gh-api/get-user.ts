import { CustomError, SimpleHttpError } from "../error/error-model";
import { auth } from "../octokit/octokit-client";

export const getUser = (baseUrl: string) => async (username: string) => {
  const response = await fetch(`${baseUrl}/users/${username}`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${auth}`,
    },
  });

  const clone = response.clone();

  if (!response.ok) {
    let error: any;
    const clone = response.clone();

    try {
      error = response.json();
    } catch (e) {
      error = clone.text();
    }

    throw new SimpleHttpError(
      typeof error === "string" ? error : error.message ?? "Request failed",
      response.status
    );
  }

  try {
    const result = await response.json();
    return result;
  } catch (e) {
    const text = await clone.text();
    throw new CustomError(
      "JSON parse error: " + (e.message ?? "") + ". Response text: " + text
    );
  }
};
