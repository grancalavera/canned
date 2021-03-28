import { useEffect, useState } from "react";
import { useQuery, UseQueryOptions, UseQueryResult } from "react-query";

export const useCannedCollectionQuery = <
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData
>(
  queryOptions: UseQueryOptions<TQueryFnData[], TError, TData[]>
): readonly [TData[], UseQueryResult<TData[], TError>] => {
  const [collection, setCollection] = useState<TData[]>([]);

  const result = useQuery(queryOptions);

  const { isSuccess, data } = result;

  useEffect(() => {
    if (isSuccess && data) {
      setCollection(data);
    }
  }, [isSuccess, data]);

  return [collection, result];
};
