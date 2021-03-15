import { Octokit } from "@octokit/rest";
import React, { ErrorInfo } from "react";
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
import { parseHTTPError, parseJSONParseError } from "./error/error-model";
import { success } from "./fp/result";

export const auth = process.env.REACT_APP_GITHUB_TOKEN;
export const octokitClient = new Octokit({ auth });

const getUserWithFetch = cannedFetchClient<{ username: string }>({
  fetchFn: ({ username }) =>
    fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${auth}`,
      },
    }),
  parseHTTPError,
  parseJSONParseError,
});

const getUserWithOctokit = octokitClient.users.getByUsername;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export function App() {
  return (
    <ErrorBoundary>
      <Example />
    </ErrorBoundary>
  );
}

class ErrorBoundary extends React.Component<{}, { error?: Error }> {
  constructor(props: {}) {
    super(props);
    this.state = { error: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.log(error, errorInfo);
  }

  render() {
    // if (this.state.error) {
    //   alert(`Error handled: ${this.state.error}`);
    // }

    if (this.state.error) {
      return <>Bad stuff</>;
    } else {
      return this.props.children;
    }
  }
}

const Example = () => (
  <QueryClientProvider client={queryClient}>
    <TimeBomb />
    <UserByUsername
      queryKey="get-user-1"
      username="grancalavera"
      mapper={alwaysFailResponseMapper}
      requestFn={getUserWithFetch}
    />
    <hr />
    <UserByUsername
      queryKey="get-user-2"
      username="juanqwerty"
      mapper={constantMapper({ username: "Juan Qwerty 1" })}
      requestFn={getUserWithOctokit}
    />
    <hr />
    <UserByUsername
      queryKey="get-user-3"
      username="grancalavera"
      mapper={{
        mapResponse: success,
        mapError: () => success({ username: "Juan Qwerty 2" }),
      }}
      requestFn={getUserWithOctokit}
    />
    <hr />
    <UserByUsername
      queryKey="get-user-4"
      username="grancalavera"
      requestFn={getUserWithFetch}
    />
    <hr />
    <UserByUsername
      queryKey="get-user-5"
      username="grancalavera"
      requestFn={getUserWithOctokit}
    />
    <ReactQueryDevtools />
  </QueryClientProvider>
);

interface UserByUsernameProps {
  queryKey: string;
  username: string;
  mapper?: CannedResponseMapper<Error, any, any>;
  requestFn: CannedRequestFn<{ username: string }>;
}

const UserByUsername = ({
  requestFn,
  username,
  mapper = naiveResponseMapper,
  queryKey: keyString,
}: UserByUsernameProps) => {
  const result = useQuery<any, any>({
    queryKey: [keyString, { username }],
    queryFn: cannedQueryFunction({ mapper, requestFn }),
    // useErrorBoundary: true,
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

const TimeBomb = () => {
  setTimeout(() => {
    throw new Error("Boom!");
  }, 1000);

  return null;
};
