import { successOrThrow, Result, success } from "../fp/result";

export interface CannedMapper<TError extends Error, TResponse = any, TModel = any> {
  mapResponse: (response: TResponse) => Result<TModel, TError>;
  mapError?: (error: any) => Result<TModel, TError>;
}

export type CannedRequest<TResponse = any> = () => Promise<TResponse>;

// Throws `TError`
export const cannedMapper = <TError extends Error = Error, TResponse = any, TModel = any>(
  mapper: CannedMapper<TError, TResponse, TModel>
) => async (request: CannedRequest<TResponse>): Promise<TModel> => {
  try {
    const response = await request();
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

export const identityMapper = cannedMapper({ mapResponse: success });
