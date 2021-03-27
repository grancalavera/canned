import { QueryFunction } from "react-query";
import { CannedResponseMapper } from "./canned-response-mapper";

interface CannedQueryFunctionOptions<TResponse = unknown, TModel = unknown> {
  queryFn: QueryFunction<TResponse>;
  mapper: CannedResponseMapper<TResponse, TModel>;
}

export const cannedQueryFunction = <TResponse = unknown, TModel = unknown>(
  options: CannedQueryFunctionOptions<TResponse, TModel>
): QueryFunction<TModel> => {
  const {
    mapper: { fromResponse, fromError },
    queryFn,
  } = options;

  const queryFunction: QueryFunction<TModel> = async (context) => {
    let response: TResponse;

    try {
      response = await queryFn(context);
    } catch (error) {
      const fallback = fromError(error);
      return fallback;
    }

    const result = fromResponse(response);
    return result;
  };

  return queryFunction;
};
