import { failure, Result, success, successOrThrow } from "./result";

/**
 * Specification for response mapping.
 */
export interface CannedResponseMapper<
  TError extends Error,
  TResponse = any,
  TModel = any
> {
  /**
   * Maps a request response response to the application's data model.
   */
  mapResponse: (response: TResponse) => Result<TModel, TError>;

  /**
   * Maps a request error into the application's data model.
   */
  mapError?: (error: any) => Result<TModel, TError>;
}

// Throws `TError`
export const cannedResponseMapper = <
  TError extends Error = Error,
  TResponse = any,
  TModel = any
>(
  mapper: CannedResponseMapper<TError, TResponse, TModel>
) => {
  const fromError = (error: any) => {
    if (mapper.mapError) {
      const fallback = mapper.mapError(error);
      return successOrThrow(fallback);
    } else {
      throw error;
    }
  };

  const fromResponse = (response: TResponse) => {
    try {
      const result = mapper.mapResponse(response);
      return successOrThrow(result);
    } catch (error) {
      return fromError(error);
    }
  };

  return { fromResponse, fromError };
};

export const naiveMapper: CannedResponseMapper<never> = { mapResponse: success };
export const alwaysFailResponseMapper: CannedResponseMapper<Error> = {
  mapResponse: () => failure(new Error("Always fail")),
};

export const alwaysVoidMapper: CannedResponseMapper<Error, void> = {
  mapResponse: () => success(undefined),
  mapError: () => success(undefined),
};

export const constantMapper = <TResponse = any>(
  response: TResponse
): CannedResponseMapper<never, TResponse> => ({
  mapResponse: () => {
    return success(response);
  },
  mapError: () => {
    return success(response);
  },
});
