import { Alert } from "@blueprintjs/core";
import React, { ReactNode } from "react";
import { useDismissError, useErrorState } from "./error-handler-state";

interface ErrorBoundaryProps {
  children?: ReactNode;
}

export const ErrorBoundary = ({ children }: ErrorBoundaryProps) => {
  return (
    <>
      <ErrorHandler />
      {children}
    </>
  );
};

const ErrorHandler = () => {
  const dismissError = useDismissError();
  const { nextError, errorCount } = useErrorState();

  return (
    <Alert
      isOpen={!!nextError}
      intent="danger"
      confirmButtonText="Dismiss"
      onConfirm={() => dismissError()}
      icon="error"
      className="bp3-dark"
    >
      <div>
        <p>
          <em>Errors: {errorCount}</em> {JSON.stringify(nextError)}
        </p>
      </div>
    </Alert>
  );
};
