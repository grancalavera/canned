import React from "react";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { ErrorBoundary } from "./error/error-boundary";
import { SimpleHttpError } from "./error/error-model";
import { getUser } from "./gh-api/get-user";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <User />
        <ReactQueryDevtools />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

const User = () => {
  const result = useQuery<any, SimpleHttpError>("user", () => getUser("juanqwerty"));
  return (
    <div>
      <p> isSuccess: {result.isSuccess.toString()}</p>
      <p> isError: {result.isError.toString()}</p>
      <pre>{JSON.stringify(result.data, null, 2)}</pre>
      <p>
        {result.error?.status} {result.error?.message}
      </p>
    </div>
  );
};
