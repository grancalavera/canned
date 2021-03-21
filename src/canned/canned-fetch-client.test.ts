import { cannedFetchClient, defaultCannedFetchClient } from "./canned-fetch-client";

// only testing content-type=application/json
describe("canned fetch client", () => {
  it("200 should be ok", () => {
    const sendRequest = defaultCannedFetchClient(async () => {
      const body = JSON.stringify({ ok: true });
      const init = { status: 200 };
      return new Response(body, init);
    });
    // I think this might be fine, since we can't use any param unless
    // also,the call to the client will be done internally, so we can ensure
    // we always pass the correct arguments
    return expect(sendRequest({})).resolves.toEqual({ ok: true });
  });

  it("400 should throw", () => {
    const sendRequest = defaultCannedFetchClient(
      async () =>
        new Response(JSON.stringify({ message: "failure" }), {
          status: 400,
          statusText: "Bad Request",
        })
    );

    const error = new Error("Bad Request");
    error.name = "400";

    return expect(sendRequest({})).rejects.toEqual(error);
  });

  it("non json responses should throw", () => {
    const sendRequest = defaultCannedFetchClient(
      async () => new Response("this will not parse", { status: 200 })
    );

    return expect(sendRequest({})).rejects.toBeTruthy();
  });

  it("should parse custom errors", () => {
    interface ErrorResponse {
      name: string;
      errors: string[];
    }

    class RequestError extends Error {
      constructor(
        message: string,
        public readonly status: number,
        name: string,
        public readonly errors: string[]
      ) {
        super(message);
        this.name = name;
      }
    }
    const errorResponse: ErrorResponse = {
      name: "custom error",
      errors: ["error 1", "error 2"],
    };

    const requestError = new RequestError(
      "Bad Request",
      400,
      errorResponse.name,
      errorResponse.errors
    );

    const sendRequest = cannedFetchClient(
      (status, statusText, response: ErrorResponse) => {
        return new RequestError(statusText, status, response.name, response.errors);
      }
    )(
      async () =>
        new Response(JSON.stringify(errorResponse), {
          status: 400,
          statusText: "Bad Request",
        })
    );

    return expect(sendRequest({})).rejects.toThrowError(requestError);
  });
});
