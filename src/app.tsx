import { Octokit } from "@octokit/rest";
import React, { ErrorInfo, useState } from "react";
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
import {
  ApplicationError,
  parseHTTPError,
  parseJSONParseError,
} from "./error/error-model";
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
const errorStyle = { backgroundColor: "red", color: "white", padding: 10 };

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export function App() {
  const [error, handleError] = useState<Error>();

  return (
    <QueryClientProvider client={queryClient}>
      {error && <ShowError error={error} />}
      <h1>Failures</h1>
      <ErrorBoundary>
        <UserByUsername
          queryKey="get-user-1"
          username="grancalavera"
          mapper={alwaysFailResponseMapper}
          requestFn={getUserWithFetch}
        />
      </ErrorBoundary>
      <hr />
      <ErrorBoundary>
        <UserByUsername
          queryKey="get-user-2"
          username="juanqwerty"
          requestFn={getUserWithOctokit}
          handleError={handleError}
        />
      </ErrorBoundary>
      <hr />
      <h1>Successes</h1>
      <ErrorBoundary>
        <UserByUsername
          queryKey="get-user-3"
          username="juanqwerty"
          mapper={constantMapper({ username: "Juan Qwerty" })}
          requestFn={getUserWithOctokit}
        />
      </ErrorBoundary>
      <hr />
      <ErrorBoundary>
        <UserByUsername
          queryKey="get-user-4"
          username="juanqwerty"
          mapper={{
            mapResponse: success,
            mapError: () => success({ username: "Juan Qwerty" }),
          }}
          requestFn={getUserWithOctokit}
        />
      </ErrorBoundary>
      <hr />
      <ErrorBoundary>
        <UserByUsername
          queryKey="get-user-5"
          username="grancalavera"
          requestFn={getUserWithFetch}
        />
      </ErrorBoundary>
      <hr />
      <ErrorBoundary>
        <UserByUsername
          queryKey="get-user-6"
          username="grancalavera"
          requestFn={getUserWithOctokit}
        />
      </ErrorBoundary>
      <ReactQueryDevtools />
    </QueryClientProvider>
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
    if (this.state.error) {
      return <ShowError error={this.state.error} />;
    } else {
      return this.props.children;
    }
  }
}

interface UserByUsernameProps {
  queryKey: string;
  username: string;
  requestFn: CannedRequestFn<{ username: string }>;
  mapper?: CannedResponseMapper<Error, any, any>;
  handleError?: (error: Error) => void;
}

const UserByUsername = ({
  requestFn,
  username,
  mapper = naiveResponseMapper,
  queryKey: keyString,
  handleError,
}: UserByUsernameProps) => {
  const result = useQuery({
    queryKey: [keyString, { username }],
    queryFn: cannedQueryFunction({ mapper, requestFn }),
    useErrorBoundary: !handleError,
    onError: handleError,
  });

  return (
    <>
      {result.data && <pre>{JSON.stringify(result.data, null, 2)}</pre>}
      {result.error && <ShowError error={result.error} />}
    </>
  );
};

const ShowError = ({ error }: { error: Error }) => {
  return (
    <div style={errorStyle}>
      <h1>Error!</h1>
      <pre style={errorStyle}>{JSON.stringify(error, null, 2)}</pre>
    </div>
  );
};
