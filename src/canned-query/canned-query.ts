import { RequestError } from "@octokit/types";
import { useEffect } from "react";
import { QueryObserverResult, UseQueryOptions } from "react-query";
import { useErrorHandler, useRaiseUnknownError } from "../error/error-handler-state";
import { AppError } from "../error/error-model";

interface CannedQueryOptions {
  handleError?: (error: AppError) => void;
}

export type CannedQuery<TParams, TResponse> = (
  params: TParams,
  options?: UseQueryOptions<TResponse, RequestError>
) => QueryObserverResult<TResponse, RequestError>;

export const createCannedQuery = <TParams, TResponse>(
  useCannedQuery: CannedQuery<TParams, TResponse>
) => (
  params: TParams,
  options?: CannedQueryOptions & UseQueryOptions<TResponse, RequestError>
) => {
  const defaultErrorHandler = useErrorHandler();
  const raiseUnknownError = useRaiseUnknownError();

  const queryResult = useCannedQuery(params, options);
  const { isError, error } = queryResult;
  const handleError = options?.handleError ?? defaultErrorHandler;

  useEffect(() => {
    if (isError && error) {
      handleError(error);
    } else if (isError) {
      raiseUnknownError(error);
    }
  }, [isError, error, handleError, raiseUnknownError]);

  return queryResult;
};
