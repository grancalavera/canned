import { QueryFunction, QueryFunctionContext } from "react-query";
import { CannedResponseMapper } from "./canned-response-mapper";

interface CannedQueryFunctionOptions<TResponse = any, TModel = any> {
  requestFn: QueryFunction<TResponse>;
  mapper: CannedResponseMapper<TResponse, TModel>;
}

export const cannedQueryFunction = <
  TResponse = any,
  TModel = any,
  TParams = any,
  TPageParam = any
>(
  options: CannedQueryFunctionOptions<TResponse, TModel>
): QueryFunction<TModel> => {
  const {
    mapper: { fromResponse, fromError },
    requestFn,
  } = options;

  const queryFunction: QueryFunction<TModel> = async (
    context: QueryFunctionContext<[string, TParams], TPageParam>
  ) => {
    let response: TResponse;

    try {
      response = await requestFn(context);
    } catch (error) {
      const fallback = fromError(error);
      return fallback;
    }

    const result = fromResponse(response);
    return result;
  };

  return queryFunction;
};
