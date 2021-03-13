import { auth } from "../octokit/octokit-client";

interface Params {
  username: string;
}

export const getUser = ({ username }: Params) =>
  fetch(`https://api.github.com/users/${username}`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${auth}`,
    },
  });
