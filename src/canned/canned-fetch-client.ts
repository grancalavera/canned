export type FetchClient<TParams = unknown, TResult = unknown> = (
  params: TParams
) => Promise<TResult>;

export const cannedFetchClient = (
  parseHTTPError?: (status: number, statusText: string, response: any) => Error
) => <TResult = unknown, TParams = unknown>(
  fetchFn: FetchClient<TParams, Response>
): FetchClient<TParams, TResult> => async (params) => {
  const response = await fetchFn(params);
  const result = await response.json();

  if (response.ok) {
    return result as TResult;
  } else {
    if (parseHTTPError) {
      const error = parseHTTPError(response.status, response.statusText, response);
      throw error;
    } else {
      const error = new Error(`${response.status} ${response.statusText}`);
      error.name = "HttpError";
      throw error;
    }
  }
};

export const defaultCannedFetchClient = cannedFetchClient();
