import { resultMapper } from "../canned/canned-mapper";
import { CustomError, SimpleHttpError } from "../error/error-model";
import { auth } from "../octokit/octokit-client";

type GetUserKey = { queryKey: ["get-user", { username: string }] };

export const useGetUser = (username: string) => {
  const key = ["get-user", { username }];
};

export const getUser = (baseUrl: string) => async (username: string) => {
  return await fetch(`${baseUrl}/users/${username}`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${auth}`,
    },
  });
};

const getTheUser = async (k: GetUserKey) => {
  const {
    queryKey: [, { username }],
  } = k;
  const client = getUser("");
  const a = await client(username);
  const b = await parseFetchResponse<any>(a);
  const c = resultMapper(b);
  return c;
};

type FetchErrorParser = (response: Response) => Promise<Error>;

interface FetchResponseParserOptions {
  parseHTTPError: FetchErrorParser;
  parseJSONParseError: FetchErrorParser;
}

const fetchResponseParser = (options: FetchResponseParserOptions) => async <
  T extends unknown = unknown
>(
  response: Response
): Promise<T> => {
  const { parseHTTPError, parseJSONParseError } = options;
  const responseClone = response.clone();

  if (!response.ok) {
    const error = await parseHTTPError(responseClone);
    throw error;
  }

  try {
    const result = await response.json();
    return result as T;
  } catch (e) {
    const error = await parseJSONParseError(responseClone);
    throw error;
  }
};

const parseHTTPError: FetchErrorParser = async (response) => {
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

const parseJSONParseError: FetchErrorParser = async (response) => {
  const responseText = await response.text();
  const error = new CustomError(`JSON parse error. Response text: ${responseText}`);
  return error;
};

const parseFetchResponse = fetchResponseParser({ parseHTTPError, parseJSONParseError });
