import { RequestError } from "@octokit/types";
import { FetchErrorParser } from "../canned/canned-response-parser";

export type ApplicationError = RequestError | SimpleHttpError | CustomError | Error;

// https://github.com/microsoft/TypeScript/issues/13965
// https://github.com/octokit/request-error.js/blob/master/src/index.ts

export class SimpleHttpError extends Error {
  public readonly status: number;
  public readonly kind = "SimpleHttpError";
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export class CustomError extends Error {
  public readonly kind = "CustomError";
}

export const isRequestError = (unsafeError: any): unsafeError is RequestError => {
  return (
    typeof unsafeError.name === "string" &&
    typeof unsafeError.status === "number" &&
    typeof unsafeError.documentation_url === "string" &&
    Array.isArray(unsafeError.errors ?? [])
  );
};

export const parseHTTPError: FetchErrorParser = async (response) => {
  const responseClone = response.clone();
  let e: any;

  try {
    e = await response.json();
  } catch {
    e = await responseClone.text();
  }

  const error = new SimpleHttpError(
    typeof e === "string" ? e : e.message ?? "Request failed",
    response.status
  );

  return error;
};

export const parseJSONParseError: FetchErrorParser = async (response) => {
  const responseText = await response.text();
  const error = new CustomError(`JSON parse error. Response text: ${responseText}`);
  return error;
};

export const isApplicationError = (e: unknown): e is ApplicationError => {
  return (
    isRequestError(e) ||
    (e as any).kind === "CustomError" ||
    (e as any).kind === "SimpleHttpError"
  );
};
