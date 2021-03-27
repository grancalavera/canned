import { useQuery, UseQueryOptions, UseQueryResult } from "react-query";

export interface CannedQueryOptions {
  // probably this can be configured directly in react query
  defaultErrorHandler?: <TError = unknown>(error: TError) => void;
}

export const cannedCollectionQuery = (cannedOptions: CannedQueryOptions) => {
  const { defaultErrorHandler } = cannedOptions;

  return function useCannedCollectionQuery<
    TQueryFnData = unknown,
    TError = unknown,
    TData = TQueryFnData
  >(
    queryOptions: UseQueryOptions<TQueryFnData, TError, TData>
  ): UseQueryResult<TData, TError> {
    return useQuery({
      ...queryOptions,
      onError: queryOptions.onError ?? defaultErrorHandler,
    });
  };
};
