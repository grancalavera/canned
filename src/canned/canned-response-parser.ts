export type FetchErrorParser = (response: Response) => Promise<Error>;

export interface CannedResponseParserOptions {
  parseHTTPError: FetchErrorParser;
  parseJSONParseError: FetchErrorParser;
}

export const cannedResponseParser = (options: CannedResponseParserOptions) => async <
  T extends any = any
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
