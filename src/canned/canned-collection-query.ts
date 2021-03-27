import { useEffect, useState } from "react";
import { useQuery, UseQueryOptions, UseQueryResult } from "react-query";
import { CannedQueryOptions } from "./canned-query";

export interface CannedCollectionQueryOptions extends CannedQueryOptions {}

export const cannedCollectionQuery = (cannedOptions: CannedCollectionQueryOptions) => {
  const { defaultErrorHandler } = cannedOptions;

  return function useCannedCollectionQuery<
    TQueryFnData = unknown,
    TError = unknown,
    TData = TQueryFnData
  >(
    queryOptions: UseQueryOptions<TQueryFnData[], TError, TData[]>
  ): readonly [TData[], UseQueryResult<TData[], TError>] {
    const [collection, setCollection] = useState<TData[]>([]);

    const result = useQuery({
      ...queryOptions,
      onError: queryOptions.onError ?? defaultErrorHandler,
    });

    const { isSuccess, data } = result;

    useEffect(() => {
      if (isSuccess && data) {
        setCollection(data);
      }
    }, [isSuccess, data]);

    return [collection, result];
  };
};
