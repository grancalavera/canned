import React from "react";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { cannedFetchClient } from "./canned/canned-fetch-client";
import { cannedQueryFunction, CannedRequestFn } from "./canned/canned-query-function";
import {
  alwaysFailResponseMapper,
  CannedResponseMapper,
  constantMapper,
  naiveResponseMapper,
} from "./canned/canned-response-mapper";
import { ErrorBoundary } from "./error/error-boundary";
import { useErrorHandler } from "./error/error-handler-state";
import {
  isApplicationError,
  parseHTTPError,
  parseJSONParseError,
} from "./error/error-model";
import { success } from "./fp/result";
import { getUser } from "./gh-api/get-user";
import { octokitClient } from "./octokit/octokit-client";

const fetchRequestFn = cannedFetchClient({
  fetchFn: getUser,
  parseHTTPError,
  parseJSONParseError,
});

export function App() {
  const handleError = useErrorHandler();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        onError: (e) => {
          if (isApplicationError(e)) {
            handleError(e);
          }
        },
        retry: false,
      },
    },
  });
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <UserByUsername
          keyString="get-user-1"
          username="grancalavera"
          mapper={alwaysFailResponseMapper}
          requestFn={fetchRequestFn}
        />
        <hr />
        <UserByUsername
          keyString="get-user-2"
          username="juanpicharro"
          mapper={constantMapper({ username: "Juan Picharro 1" })}
          requestFn={octokitClient.users.getByUsername}
        />
        <hr />
        <UserByUsername
          keyString="get-user-3"
          username="grancalavera"
          mapper={{
            mapResponse: success,
            mapError: () => success({ username: "Juan Picharro 2" }),
          }}
          requestFn={octokitClient.users.getByUsername}
        />
        <hr />
        <UserByUsername
          keyString="get-user-4"
          username="grancalavera"
          requestFn={fetchRequestFn}
        />
        <hr />
        <UserByUsername
          keyString="get-user-5"
          username="grancalavera"
          requestFn={octokitClient.users.getByUsername}
        />
        <ReactQueryDevtools />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

interface UserByUsernameProps {
  keyString: string;
  username: string;
  mapper?: CannedResponseMapper<Error, any, any>;
  requestFn: CannedRequestFn<{ username: string }>;
}

const UserByUsername = ({
  requestFn,
  username,
  mapper = naiveResponseMapper,
  keyString,
}: UserByUsernameProps) => {
  const result = useQuery<any, any>({
    queryKey: [keyString, { username }],
    queryFn: cannedQueryFunction({ mapper, requestFn }),
  });

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
