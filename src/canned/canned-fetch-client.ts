export type FetchClient<TParams = unknown, TResult = unknown> = (
  params: TParams
) => Promise<TResult>;

export interface FetchClientOptions<TParams = unknown, TResult = unknown> {
  fetchFn: FetchClient<TParams, Response>;
  parseHTTPError?: FetchClient<Response, TResult>;
}

export const cannedFetchClient = <TResult = unknown, TParams = unknown>(
  options: FetchClientOptions<TParams, TResult>
): FetchClient<TParams, TResult> => async (params) => {
  const response = await options.fetchFn(params);
  const result = await response.json();

  if (response.ok) {
    return result;
  } else {
    const error = new Error(response.statusText);
    error.name = response.status.toString();
    throw error;
  }
};
