import React from "react";
import { QueryClient, QueryClientProvider, QueryFunction, useQuery } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { cannedFetchClient } from "./canned/canned-fetch-client";
import { cannedQueryFunction } from "./canned/canned-query-function";
import { naiveResponseMapper } from "./canned/canned-response-mapper";
import { ErrorBoundary } from "./error/error-boundary";
import { parseHTTPError, parseJSONParseError } from "./error/error-model";
import { getUser } from "./gh-api/get-user";
import { octokitClient } from "./octokit/octokit-client";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const fetchQueryFn = cannedQueryFunction({
  key: "user",
  mapper: naiveResponseMapper,
  requestFn: cannedFetchClient({
    fetchFn: getUser,
    parseHTTPError,
    parseJSONParseError,
  }),
});

const octokitQueryFn = cannedQueryFunction({
  key: "user",
  mapper: naiveResponseMapper,
  requestFn: (params: { username: string }) => octokitClient.users.getByUsername(params),
});

const username = "grancalavera";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <UserByUsername username={username} queryFn={octokitQueryFn} />
        <hr />
        <UserByUsername username={username} queryFn={fetchQueryFn} />
        <ReactQueryDevtools />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

interface UserByUsernameProps {
  queryFn: QueryFunction;
  username: string;
}

const UserByUsername = ({ queryFn, username }: UserByUsernameProps) => {
  const result = useQuery<any, any>(["user", { username }], queryFn);
  return (
    <div>
      <p> isSuccess: {result.isSuccess.toString()}</p>
      <p> isError: {result.isError.toString()}</p>
      <pre>{JSON.stringify(result.data, null, 2)}</pre>
      <p>
        {result.error?.status} {result.error?.toString()}
      </p>
    </div>
  );
};
