import { cannedResponseMapper } from "./canned-response-mapper";

describe("canned response mapper", () => {
  describe("defaults", () => {
    it("maps response with provided mapper", () => {
      const mapper = cannedResponseMapper({ mapResponse: (x) => true });
      const actual = mapper.fromResponse("response");

      expect(actual).toEqual(true);
    });

    it("throws errors by default", () => {
      const mapper = cannedResponseMapper({ mapResponse: (x) => true });

      expect(() => {
        mapper.fromError(new Error("boom!"));
      }).toThrowError(new Error("boom!"));
    });

    it("propagates mapResponse errors", () => {
      const mapper = cannedResponseMapper({
        mapResponse: (x) => {
          throw new Error("boom!");
        },
      });

      expect(() => mapper.fromResponse("response")).toThrowError(new Error("boom!"));
    });
  });

  describe("response error recovery", () => {
    const mapper = cannedResponseMapper({
      mapResponse: (x) => true,
      mapError: (e) => true,
    });

    it("maps response with provider mapper", () => {
      const actual = mapper.fromResponse("response");
      expect(actual).toEqual(true);
    });

    it("maps error with provider mapper", () => {
      const actual = mapper.fromError(new Error("boom!"));
      expect(actual).toEqual(true);
    });
  });

  describe("mapResponse error recovery", () => {
    const mapper = cannedResponseMapper({
      mapResponse: (x) => {
        throw new Error("boom!");
      },
      mapError: (x) => true,
    });

    it("maps error with provider mapper", () => {
      const actual = mapper.fromResponse("response");
      expect(actual).toEqual(true);
    });
  });
});
