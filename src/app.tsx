import { Octokit } from "@octokit/rest";
import React, { ErrorInfo, useCallback, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryFunction,
  QueryFunctionContext,
  useQuery,
} from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { defaultCannedFetchClient } from "./canned/canned-fetch-client";
import { cannedQueryFunction } from "./canned/canned-query-function";
import {
  cannedResponseMapper,
  CannedResponseMapper,
} from "./canned/canned-response-mapper";

export const auth = process.env.REACT_APP_GITHUB_TOKEN;
export const octokitClient = new Octokit({ auth });
type GetUserQueryKey = [string, { username: string }];
const getUserQueryKey = (keyname: string, username: string): GetUserQueryKey => [
  keyname,
  { username },
];

const naiveResponseMapper = cannedResponseMapper({ mapResponse: (x) => x });

function failResponseMapper<TResponse = never>(
  error: Error
): CannedResponseMapper<TResponse> {
  return cannedResponseMapper({
    mapResponse: () => {
      throw error;
    },
  });
}

function constantResponseMapper<TResponse = any>(
  response: TResponse
): CannedResponseMapper<unknown, TResponse> {
  return cannedResponseMapper({ mapResponse: () => response, mapError: () => response });
}

function naiveFallbackResponseMapper<TResponse = any>(fallback: TResponse) {
  return cannedResponseMapper({ mapResponse: (x) => x, mapError: () => fallback });
}

interface UserByUsernameProps {
  queryKey: GetUserQueryKey;
  requestFn: QueryFunction;
  mapper?: CannedResponseMapper<any, any>;
  handleError?: (error: Error) => void;
}

const UserByUsername = ({
  requestFn,
  mapper = naiveResponseMapper,
  queryKey,
  handleError,
}: UserByUsernameProps) => {
  const result = useQuery({
    queryKey,
    queryFn: cannedQueryFunction({ mapper, requestFn }),
    useErrorBoundary: !handleError,
    onError: handleError,
  });

  const [keyname, { username }] = queryKey;

  return (
    <>
      <h1>
        username: {username}, query name: {keyname}
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
          queryKey={getUserQueryKey("get-user-1", "grancalavera")}
          mapper={failResponseMapper(new Error("This will always fail."))}
          requestFn={getUserWithFetch}
        />
      </ErrorBoundary>
      <hr />
      <ErrorBoundary>
        <UserByUsername
          queryKey={getUserQueryKey("get-user-2", "juanqwerty")}
          requestFn={getUserWithOctokit}
          handleError={handleError}
        />
      </ErrorBoundary>
      <hr />
      <ErrorBoundary>
        <UserByUsername
          queryKey={getUserQueryKey("get-user-3", "juanqwerty")}
          requestFn={getUserWithFetch}
          handleError={handleError}
        />
      </ErrorBoundary>
      <hr />

      {/* Successes */}
      <ErrorBoundary>
        <UserByUsername
          queryKey={getUserQueryKey("get-user-4", "juanqwerty")}
          mapper={constantResponseMapper({ username: "Juan Qwerty" })}
          requestFn={getUserWithOctokit}
        />
      </ErrorBoundary>
      <hr />
      <ErrorBoundary>
        <UserByUsername
          queryKey={getUserQueryKey("get-user-5", "juanqwerty")}
          mapper={naiveFallbackResponseMapper({ username: "Juan Qwerty" })}
          requestFn={getUserWithOctokit}
        />
      </ErrorBoundary>
      <hr />
      <ErrorBoundary>
        <UserByUsername
          queryKey={getUserQueryKey("get-user-6", "grancalavera")}
          requestFn={getUserWithFetch}
        />
      </ErrorBoundary>
      <hr />
      <ErrorBoundary>
        <UserByUsername
          queryKey={getUserQueryKey("get-user-7", "grancalavera")}
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

const getUserWithFetch = defaultCannedFetchClient(
  (context: QueryFunctionContext<GetUserQueryKey>) => {
    const {
      queryKey: [, params],
    } = context;
    return fetch(`https://api.github.com/users/${params.username}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${auth}`,
      },
    });
  }
);

const getUserWithOctokit: QueryFunction<any> = (
  context: QueryFunctionContext<GetUserQueryKey>
) => {
  const {
    queryKey: [, params],
  } = context;

  return octokitClient.users.getByUsername(params);
};

const errorStyle = { backgroundColor: "red", color: "white", padding: 10 };

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});
