import { Octokit } from "@octokit/rest";
import React, { ErrorInfo, useCallback, useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { cannedFetchClient } from "./canned/canned-fetch-client";
import { cannedQueryFunction, CannedRequestFn } from "./canned/canned-query-function";
import {
  alwaysFailResponseMapper,
  CannedResponseMapper,
  constantMapper,
  naiveMapper,
} from "./canned/canned-response-mapper";
import { success } from "./canned/result";

export const auth = process.env.REACT_APP_GITHUB_TOKEN;
export const octokitClient = new Octokit({ auth });

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
  mapper = naiveMapper,
  queryKey,
  handleError,
}: UserByUsernameProps) => {
  const result = useQuery({
    queryKey: [queryKey, { username }],
    queryFn: cannedQueryFunction({ mapper, requestFn }),
    useErrorBoundary: !handleError,
    onError: handleError,
  });

  return (
    <>
      <h1>
        username: {username}, query key: {queryKey}
      </h1>
      {result.data && <pre>{JSON.stringify(result.data, null, 2)}</pre>}
      {result.error && <ShowError error={result.error} title="Component" />}
    </>
  );
};

export const App = () => {
  const [errors, setErrors] = useState<Error[]>([]);

  const handleError = useCallback((e: Error) => {
    setErrors((es) => [...es, e]);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {errors.map((e, i) => (
        <div key={`error-${i}`}>
          <ShowError
            error={e}
            title={`Global Error Handler (${i + 1} of ${errors.length})`}
          />
          <hr />
        </div>
      ))}
      {/* Failures */}
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
      <ErrorBoundary>
        <UserByUsername
          queryKey="get-user-3"
          username="juanqwerty"
          requestFn={getUserWithFetch}
          handleError={handleError}
        />
      </ErrorBoundary>
      <hr />

      {/* Successes */}
      <ErrorBoundary>
        <UserByUsername
          queryKey="get-user-4"
          username="juanqwerty"
          mapper={constantMapper({ username: "Juan Qwerty" })}
          requestFn={getUserWithOctokit}
        />
      </ErrorBoundary>
      <hr />
      <ErrorBoundary>
        <UserByUsername
          queryKey="get-user-5"
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
          queryKey="get-user-6"
          username="grancalavera"
          requestFn={getUserWithFetch}
        />
      </ErrorBoundary>
      <hr />
      <ErrorBoundary>
        <UserByUsername
          queryKey="get-user-7"
          username="grancalavera"
          requestFn={getUserWithOctokit}
        />
      </ErrorBoundary>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

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
      return <ShowError error={this.state.error} title="Error Boundary" />;
    } else {
      return this.props.children;
    }
  }
}

const ShowError = ({ error, title }: { error: Error; title: string }) => {
  return (
    <div style={errorStyle}>
      <h1>{title}</h1>
      <pre>{error.toString()}</pre>
    </div>
  );
};

const getUserWithFetch = cannedFetchClient<{ username: string }>({
  fetchFn: ({ username }) =>
    fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${auth}`,
      },
    }),
});

const getUserWithOctokit = octokitClient.users.getByUsername;
const errorStyle = { backgroundColor: "red", color: "white", padding: 10 };

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});
