import { RestEndpointMethodTypes } from "@octokit/rest";
import { useQuery } from "react-query";
import { CannedQuery, createCannedQuery } from "../canned-query/canned-query";
import { octokitClient } from "./octokit-client";

export const QUERY_KEY = "users.getByUsername";
const useUsersGetByUsername: CannedQuery<
  RestEndpointMethodTypes["users"]["getByUsername"]["parameters"],
  RestEndpointMethodTypes["users"]["getByUsername"]["response"]
> = (params, options) =>
  useQuery(QUERY_KEY, () => octokitClient.users.getByUsername(params), options);

export default createCannedQuery(useUsersGetByUsername);
