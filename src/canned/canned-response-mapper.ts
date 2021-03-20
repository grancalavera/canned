/**
 * Specification for response mapping.
 */
export interface CannedResponseMapperOptions<TResponse = any, TModel = any> {
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

interface CannedResponseMapper<TResponse = any, TModel = any> {
  fromResponse: (response: TResponse) => TModel;
  fromError: (error: any) => TModel;
}

/**
 * Creates a pair of function to map successful Response or Errors into
 * an arbitrary model.
 * @param mapper the mapper configuration CannedResponseMapper<TResponse, TModel>
 * @returns CannedMappingFns<TResponse, TModel>
 */
export const cannedResponseMapper = <TResponse = any, TModel = any>(
  mapper: CannedResponseMapperOptions<TResponse, TModel>
): CannedResponseMapper<TResponse, TModel> => {
  const fromError = (error: any) => {
    if (mapper.mapError) {
      const fallback = mapper.mapError(error);
      return fallback;
    } else {
      throw error;
    }
  };

  const fromResponse = (response: TResponse) => {
    try {
      const result = mapper.mapResponse(response);
      return result;
    } catch (error) {
      return fromError(error);
    }
  };

  return { fromResponse, fromError };
};

export const naiveMapper: CannedResponseMapperOptions<unknown> = {
  mapResponse: (x) => x,
};
export const alwaysFailResponseMapper: CannedResponseMapperOptions<Error> = {
  mapResponse: () => {
    throw new Error("Always fail");
  },
};

export const alwaysVoidMapper: CannedResponseMapperOptions<Error, void> = {
  mapResponse: () => undefined,
  mapError: () => undefined,
};

export const constantMapper = <TResponse = any>(
  response: TResponse
): CannedResponseMapperOptions<unknown, TResponse> => ({
  mapResponse: () => {
    return response;
  },
  mapError: () => {
    return response;
  },
});
