import { successOrThrow, Result, success } from "../fp/result";

export interface CannedMapper<TError extends Error, TResponse = any, TModel = any> {
  mapResponse: (response: TResponse) => Result<TModel, TError>;
  mapError?: (error: any) => Result<TModel, TError>;
  handleError?: (error: TError) => void;
}

export type CannedRequest<TResponse = any> = () => Promise<TResponse>;

// Throws `TError`
export const resultMapper = <TError extends Error = Error, TResponse = any, TModel = any>(
  mapper: CannedMapper<TError, TResponse, TModel>
) => async (request: CannedRequest<TResponse>): Promise<TModel> => {
  try {
    const response = await request();
    const result = mapper.mapResponse(response);
    return successOrThrow(result);
  } catch (error) {
    if (mapper.mapError) {
      const fallback = mapper.mapError(error);
      return successOrThrow(fallback);
    } else {
      throw error;
    }
  }
};

export default resultMapper({ mapResponse: success });

/*

  Parts:

  1. A request, wrapped in the query runner function from react query. In terms of
    React Query this is called `query function`:

    type QueryFunction<T = unknown> = (context: QueryFunctionContext<any>) => T | Promise<T>;

    interface QueryFunctionContext<TQueryKey extends QueryKey = QueryKey, TPageParam = any> {
      queryKey: TQueryKey;
      pageParam?: TPageParam;
    }

    type QueryKey = string | unknown[];

*/
