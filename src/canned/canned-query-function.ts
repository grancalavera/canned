import { QueryFunction, QueryFunctionContext } from "react-query";
import {
  cannedResponseMapper,
  CannedResponseMapperOptions,
} from "./canned-response-mapper";

export type CannedRequestFn<TParams = any, TPageParam = any, TResponse = any> = (
  params: TParams,
  pageParam?: TPageParam
) => Promise<TResponse>;

interface CannedQueryFunctionOptions<
  TResponse = any,
  TModel = any,
  TParams = any,
  TPageParam = any
> {
  requestFn: CannedRequestFn<TParams, TPageParam, TResponse>;
  mapper: CannedResponseMapperOptions<TResponse, TModel>;
}

export const cannedQueryFunction = <
  TResponse = any,
  TModel = any,
  TParams = any,
  TPageParam = any
>(
  options: CannedQueryFunctionOptions<TResponse, TModel, TParams, TPageParam>
): QueryFunction<TModel> => {
  const { mapper, requestFn } = options;
  const map = cannedResponseMapper(mapper);

  const queryFunction: QueryFunction<TModel> = async (
    context: QueryFunctionContext<[string, TParams], TPageParam>
  ) => {
    const {
      queryKey: [, params],
      pageParam,
    } = context;

    let response: TResponse;

    try {
      response = await requestFn(params, pageParam);
    } catch (error) {
      const fallback = map.fromError(error);
      return fallback;
    }

    const result = map.fromResponse(response);
    return result;
  };

  return queryFunction;
};
