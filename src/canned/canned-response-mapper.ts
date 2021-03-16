import { CustomError } from "../error/error-model";
import { failure, Result, success, successOrThrow } from "../fp/result";

export interface CannedResponseMapper<
  TError extends Error,
  TResponse = any,
  TModel = any
> {
  /**
   * Maps DTO to Model, as usual, but optionally can also fail. We can use this to handle
      "validation errors in disguise": map a 200 status to an application error.
   */
  mapResponse: (response: TResponse) => Result<TModel, TError>;

  /**
   * This is the opposite as above. Maps an error typed with `any` to an error in the
      application's model. As well can be used to write fallbacks, allowing for example
      to recover from 404 status to a default resource.
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

export const naiveResponseMapper: CannedResponseMapper<never> = { mapResponse: success };
export const alwaysFailResponseMapper: CannedResponseMapper<Error> = {
  mapResponse: () => failure(new CustomError("Always fail.")),
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
