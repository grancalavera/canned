export interface CannedFetchClientOptions<TParams = any, TPageParam = any> {
  fetchFn: (params: TParams, pageParam?: TPageParam) => Promise<Response>;
}

export const cannedFetchClient = <TParams = any, TResponse = any, TPageParam = any>(
  options: CannedFetchClientOptions<TParams, TPageParam> &
    Partial<CannedResponseParserOptions>
) => {
  const { fetchFn, ...parserOptions } = options;
  const parseResponse = cannedResponseParser({
    parseHTTPError: parserOptions.parseHTTPError ?? defaultParseHTTPError,
    parseJSONParseError: parserOptions.parseJSONParseError ?? defaultParseJSONParseError,
  });

  const fetchRequest = async (
    params: TParams,
    pageParam?: TPageParam
  ): Promise<TResponse> => {
    const response = await fetchFn(params, pageParam);
    const result = await parseResponse<TResponse>(response);
    return result;
  };

  return fetchRequest;
};

export type ParseFetchError = (response: Response) => Promise<Error>;
export type ParseFetchResponse = <T extends any = any>(response: Response) => Promise<T>;

export interface CannedResponseParserOptions {
  parseHTTPError: ParseFetchError;
  parseJSONParseError: ParseFetchError;
}

export interface CannedResponseParser {
  (options: CannedResponseParserOptions): <T extends any = any>(
    response: Response
  ) => Promise<T>;
}

const cannedResponseParser: CannedResponseParser = (options) => async (
  response: Response
) => {
  const { parseHTTPError, parseJSONParseError } = options;
  const responseClone = response.clone();

  if (!response.ok) {
    const error = await parseHTTPError(responseClone);
    throw error;
  }

  try {
    const result = await response.json();
    return result;
  } catch (e) {
    const error = await parseJSONParseError(responseClone);
    throw error;
  }
};

export const defaultParseHTTPError: ParseFetchError = async (response) => {
  const responseClone = response.clone();
  let e: any;

  try {
    e = await response.json();
  } catch {
    e = await responseClone.text();
  }

  const message: string = `${response.status} ${
    typeof e === "string" ? e : e.message ?? "Request failed"
  }`;

  const error = new Error(message);
  error.name = "HttpError";
  return error;
};

export const defaultParseJSONParseError: ParseFetchError = async (response) => {
  const responseText = await response.text();
  const error = new Error(`JSON parse error. Response text: ${responseText}`);
  return error;
};
