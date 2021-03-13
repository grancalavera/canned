import {
  cannedResponseParser,
  CannedResponseParserOptions,
} from "./canned-response-parser";

export interface CannedFetchClientOptions<TParams = any, TPageParam = any> {
  fetchFn: (params: TParams, pageParam?: TPageParam) => Promise<Response>;
}

export const cannedFetchClient = <TParams = any, TPageParam = any, TResponse = any>(
  options: CannedFetchClientOptions<TParams, TPageParam> & CannedResponseParserOptions
) => {
  const { fetchFn, ...parserOptions } = options;
  const parseResponse = cannedResponseParser(parserOptions);

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
