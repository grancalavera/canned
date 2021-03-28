import { Octokit } from "@octokit/rest";
import React, { ErrorInfo, useCallback, useRef, useState } from "react";
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

const getUserQueryKey = (keyName: string, username: string): GetUserQueryKey => [
  keyName,
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
  queryFn: QueryFunction;
  mapper?: CannedResponseMapper<any, any>;
  useErrorBoundary?: boolean;
  onError?: (error: Error) => void;
}

const UserByUsername = ({
  queryFn,
  mapper = naiveResponseMapper,
  queryKey,
  useErrorBoundary = false,
  onError,
}: UserByUsernameProps) => {
  const result = useQuery<unknown, Error>({
    queryKey,
    queryFn: cannedQueryFunction({ mapper, queryFn }),
    ...(useErrorBoundary !== undefined && { useErrorBoundary }),
    ...(onError && { onError }),
  });

  const [keyName, { username }] = queryKey;

  return (
    <>
      <h1>
        username: {username}, key name: {keyName}
      </h1>
      {result.data && <pre>{JSON.stringify(result.data, null, 2)}</pre>}
      {result.error && <ShowError error={result.error} title="Component" />}
    </>
  );
};

const useQueryClient = (handleError: (error: any) => void) => {
  const queryClientRef = useRef<QueryClient>(
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
          onError: handleError,
        },
      },
    })
  );

  return queryClientRef.current;
};

export const App = () => {
  const [errors, setErrors] = useState<Error[]>([]);

  const handleError = useCallback((e: Error) => {
    setErrors((es) => [...es, e]);
  }, []);

  const queryClient = useQueryClient(handleError);

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
      <ErrorBoundary title="get-user-1">
        <UserByUsername
          queryKey={getUserQueryKey("get-user-1", "grancalavera")}
          mapper={failResponseMapper(new Error("This will always fail."))}
          queryFn={getUserWithFetch}
          useErrorBoundary={true}
        />
      </ErrorBoundary>
      <hr />
      <ErrorBoundary title="get-user-2">
        <UserByUsername
          queryKey={getUserQueryKey("get-user-2", "juanqwerty")}
          queryFn={getUserWithOctokit}
          onError={(error) =>
            console.warn(`error handled locally by get-user-2: ${error}`)
          }
          useErrorBoundary={true}
        />
      </ErrorBoundary>
      <hr />
      <ErrorBoundary title="get-user-3">
        <UserByUsername
          queryKey={getUserQueryKey("get-user-3", "juanqwerty")}
          queryFn={getUserWithFetch}
        />
      </ErrorBoundary>
      <hr />

      {/* Successes */}
      <ErrorBoundary title="get-user-4">
        <UserByUsername
          queryKey={getUserQueryKey("get-user-4", "juanqwerty")}
          mapper={constantResponseMapper({ username: "Juan Qwerty" })}
          queryFn={getUserWithOctokit}
        />
      </ErrorBoundary>
      <hr />
      <ErrorBoundary title="get-user-5">
        <UserByUsername
          queryKey={getUserQueryKey("get-user-5", "juanqwerty")}
          mapper={naiveFallbackResponseMapper({ username: "Juan Qwerty" })}
          queryFn={getUserWithOctokit}
        />
      </ErrorBoundary>
      <hr />
      <ErrorBoundary title="get-user-6">
        <UserByUsername
          queryKey={getUserQueryKey("get-user-6", "grancalavera")}
          queryFn={getUserWithFetch}
        />
      </ErrorBoundary>
      <hr />
      <ErrorBoundary title="get-user-7">
        <UserByUsername
          queryKey={getUserQueryKey("get-user-7", "grancalavera")}
          queryFn={getUserWithOctokit}
        />
      </ErrorBoundary>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

class ErrorBoundary extends React.Component<{ title: string }, { error?: Error }> {
  constructor(props: { title: string }) {
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
      return (
        <ShowError
          error={this.state.error}
          title={`Error Boundary ${this.props.title}`}
        />
      );
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
