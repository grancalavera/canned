import { CustomError, SimpleHttpError } from "../error/error-model";
import { auth } from "../octokit/octokit-client";

export const getUser = (baseUrl: string) => async (username: string) => {
  const response = await fetch(`${baseUrl}/users/${username}`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${auth}`,
    },
  });

  const result = await parseFetchResponse<any>(response);
  return result;
};

type FetchErrorParser<E extends Error> = (response: Response) => Promise<E>;

interface FetchResponseParserOptions<
  EHttp extends Error = Error,
  EParse extends Error = Error
> {
  parseHTTPError: FetchErrorParser<EHttp>;
  parseJSONParseError: FetchErrorParser<EParse>;
}

const fetchResponseParser = <EHttp extends Error = Error, EParse extends Error = Error>(
  options: FetchResponseParserOptions<EHttp, EParse>
) => async <T extends unknown = unknown>(response: Response): Promise<T> => {
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

const parseHTTPError: FetchErrorParser<SimpleHttpError> = async (response) => {
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

const parseJSONParseError: FetchErrorParser<CustomError> = async (response) => {
  const responseText = await response.text();
  const error = new CustomError(`JSON parse error. Response text: ${responseText}`);
  return error;
};

const parseFetchResponse = fetchResponseParser({ parseHTTPError, parseJSONParseError });
