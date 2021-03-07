import { getUser } from "./get-user";
import nock from "nock";
// import fetch from "node-fetch";

const username = "juanpicharro";

describe("does it really throw?", () => {
  it("doesn't parse", async () => {
    nock("http://localhost").get(`/users/${username}`).reply(200, "This isn't JSON!");
    expect.assertions(2);

    try {
      await getUser("http://localhost")(username);
    } catch (e) {
      console.log(e.message);
      console.log(e);
      // eslint-disable-next-line jest/no-conditional-expect
      expect(e.message).toMatch(/^JSON parse error/);
      // eslint-disable-next-line jest/no-conditional-expect
      expect(e.kind).toEqual("CustomError");
    }
  });
});
