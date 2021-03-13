import { RestEndpointMethodTypes } from "@octokit/rest";
import { RequestError } from "@octokit/types";
import { useEffect } from "react";
import { QueryObserverResult, useQuery, UseQueryOptions } from "react-query";
import { useErrorHandler } from "../error/error-handler-state";
import { ApplicationError, CustomError } from "../error/error-model";
import { octokitClient } from "./octokit-client";

interface CannedQueryOptions<TResponse, TModel = TResponse> {
  handleError?: (error: ApplicationError) => void;
  mapResponse?: (response: TResponse) => TModel;
  mapError?: (error: ApplicationError) => TModel;
}

export type CannedQuery<TParams, TResponse, TModel = TResponse> = (
  params: TParams,
  options?: UseQueryOptions<TResponse, RequestError>
) => QueryObserverResult<TModel, RequestError>;

export const createCannedQuery = <TParams, TResponse, TModel = TResponse>(
  useCannedQuery: CannedQuery<TParams, TResponse>
) => (
  params: TParams,
  options?: CannedQueryOptions<TResponse, TModel> &
    UseQueryOptions<TResponse, RequestError>
) => {
  const defaultErrorHandler = useErrorHandler();

  const queryResult = useCannedQuery(params, options);
  const { isError, error } = queryResult;
  const handleError = options?.handleError ?? defaultErrorHandler;

  useEffect(() => {
    if (isError && error) {
      handleError(error);
    } else if (isError) {
      const e = new CustomError("unknown error");
      handleError(e);
    }
  }, [isError, error, handleError]);

  return queryResult;
};

export const QUERY_KEY = "search-users";
export const useSearchUsers: CannedQuery<
  RestEndpointMethodTypes["search"]["users"]["parameters"],
  RestEndpointMethodTypes["search"]["users"]["response"]
> = (params, options) =>
  useQuery(QUERY_KEY, () => octokitClient.search.users(params), options);

export default createCannedQuery(useSearchUsers);
