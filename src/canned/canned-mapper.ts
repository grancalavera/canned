import { successOrThrow, Result, success } from "../fp/result";

export interface CannedMapper<TError extends Error, TResponse = any, TModel = any> {
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
export const resultMapper = <TError extends Error = Error, TResponse = any, TModel = any>(
  mapper: CannedMapper<TError, TResponse, TModel>
) => (response: TResponse): TModel => {
  try {
    const result = mapper.mapResponse(response);
    return successOrThrow(result);
  } catch (error) {
    if (mapper.mapError) {
      const fallback = mapper.mapError(error);
      return successOrThrow(fallback);
    } else {
      throw error;
    }
  }
};

export default resultMapper({ mapResponse: success });
