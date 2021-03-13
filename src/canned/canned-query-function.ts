import { QueryFunction, QueryFunctionContext } from "react-query";
import { cannedResponseMapper, CannedResponseMapper } from "./canned-response-mapper";

export type CannedRequestFN<TParams = any, TPageParam = any, TResponse = any> = (
  params: TParams,
  pageParam?: TPageParam
) => Promise<TResponse>;

export interface CannedRequestFNOptions<
  TParams = any,
  TPageParam = any,
  TResponse = any
> {
  requestFn: CannedRequestFN<TParams, TPageParam, TResponse>;
}

interface CannedQueryFunctionOptions<
  TError extends Error,
  TResponse = any,
  TModel = any,
  TParams = any,
  TPageParam = any
> extends CannedRequestFNOptions<TParams, TPageParam, TResponse> {
  key: string;
  mapper: CannedResponseMapper<TError, TResponse, TModel>;
}

export const cannedQueryFunction = <
  TError extends Error,
  TResponse = any,
  TModel = any,
  TParams = any,
  TPageParam = any
>(
  options: CannedQueryFunctionOptions<TError, TResponse, TModel, TParams, TPageParam>
): QueryFunction<TModel> => {
  const { mapper, requestFn } = options;
  const mapResponse = cannedResponseMapper(mapper);

  const queryFunction: QueryFunction<TModel> = async (
    context: QueryFunctionContext<[string, TParams], TPageParam>
  ) => {
    const {
      queryKey: [, params],
      pageParam,
    } = context;

    const response = await requestFn(params, pageParam);
    const result = mapResponse(response);
    return result;
  };

  return queryFunction;
};
