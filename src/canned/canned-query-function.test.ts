import { QueryFunction } from "react-query";
import { cannedQueryFunction } from "./canned-query-function";
import { cannedResponseMapper } from "./canned-response-mapper";

const failsQueryFn: QueryFunction<boolean> = () => {
  throw new Error("boom!");
};

const succeedsQueryFn: QueryFunction<boolean> = () => true;

const identityMapper = cannedResponseMapper({ mapResponse: (x) => x });

const fallbackMapper = cannedResponseMapper({
  mapResponse: (x) => x,
  mapError: () => true,
});

const alwaysFailsMapper = cannedResponseMapper({
  mapResponse: () => {
    throw new Error("boom!");
  },
});

describe("canned query function", () => {
  it("failures should fail by default", () => {
    const cannedQueryFn = cannedQueryFunction({
      queryFn: failsQueryFn,
      mapper: identityMapper,
    });

    return expect(cannedQueryFn({ queryKey: {} })).rejects.toThrowError(
      new Error("boom!")
    );
  });

  it("failures should recover with fallbacks", () => {
    const cannedQueryFn = cannedQueryFunction({
      queryFn: failsQueryFn,
      mapper: fallbackMapper,
    });

    return expect(cannedQueryFn({ queryKey: {} })).resolves.toEqual(true);
  });

  it("successes should succeed by default", () => {
    const cannedQueryFn = cannedQueryFunction({
      queryFn: succeedsQueryFn,
      mapper: identityMapper,
    });

    return expect(cannedQueryFn({ queryKey: {} })).resolves.toEqual(true);
  });

  it("successes can be mapped to errors", () => {
    const cannedQueryFn = cannedQueryFunction({
      queryFn: succeedsQueryFn,
      mapper: alwaysFailsMapper,
    });

    return expect(cannedQueryFn({ queryKey: {} })).rejects.toThrowError(
      new Error("boom!")
    );
  });
});
