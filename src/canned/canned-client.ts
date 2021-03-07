export interface CannedMapper<TResponse = any, TModel = any> {
  // throws TError
  mapResponse: (response: TResponse) => TModel;
  // throws TError
  mapError?: (error: any) => TModel;
}

export type CannedRequest<TResponse = any> = () => Promise<TResponse>;

export const cannedMapper = <TResponse = any, TModel = any>(
  mapper: CannedMapper<TResponse, TModel>
) => async (request: CannedRequest<TResponse>): Promise<TModel> => {
  try {
    const response = await request();
    const model = mapper.mapResponse(response);
    return model;
  } catch (e) {
    if (mapper.mapError) {
      const fallback = mapper.mapError(e);
      return fallback;
    } else {
      throw e;
    }
  }
};
