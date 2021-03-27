/**
 * Specification for response mapping.
 */
export interface CannedResponseMapperOptions<TResponse = unknown, TModel = unknown> {
  /**
   * Maps a request response response to the application's data model.
   * @throws {Error} if TResponse fails to map to TModel
   */
  mapResponse: (response: TResponse) => TModel;

  /**
   * Maps a request error into the application's data model.
   * @throws {Error} if error fails to map to TModel
   */
  mapError?: (error: any) => TModel;
}

/**
 * Two functions to map either a response or an error into a model
 */
export interface CannedResponseMapper<TResponse = unknown, TModel = unknown> {
  fromResponse: (response: TResponse) => TModel;
  fromError: (error: any) => TModel;
}

/**
 * Creates a pair of functions to map successful Response or Errors into
 * an arbitrary model.
 * @param mapper the mapper configuration CannedResponseMapper<TResponse, TModel>
 * @returns CannedMappingFns<TResponse, TModel>
 */
export const cannedResponseMapper = <TResponse = unknown, TModel = unknown>({
  mapResponse,
  mapError,
}: CannedResponseMapperOptions<TResponse, TModel>): CannedResponseMapper<
  TResponse,
  TModel
> => {
  const fromError = (error: any) => {
    if (mapError) {
      const fallback = mapError(error);
      return fallback;
    } else {
      throw error;
    }
  };

  const fromResponse = (response: TResponse) => {
    try {
      const result = mapResponse(response);
      return result;
    } catch (error) {
      return fromError(error);
    }
  };

  return { fromResponse, fromError };
};
