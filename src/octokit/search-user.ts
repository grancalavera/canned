import { RestEndpointMethodTypes } from "@octokit/rest";
import { useQuery } from "react-query";
import { CannedQuery, createCannedQuery } from "../canned-query/canned-query";
import { octokitClient } from "./octokit-client";

export const QUERY_KEY = "search-users";

export const useSearchUsers: CannedQuery<
  RestEndpointMethodTypes["search"]["users"]["parameters"],
  RestEndpointMethodTypes["search"]["users"]["response"]
> = (params, options) => {
  console.log("params", params);
  return useQuery(QUERY_KEY, () => octokitClient.search.users(params), options);
};

export default createCannedQuery(useSearchUsers);
