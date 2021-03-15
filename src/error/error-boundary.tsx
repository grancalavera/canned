import { Alert } from "@blueprintjs/core";
import React, { ErrorInfo } from "react";
import { useDismissError, useErrorState } from "./error-handler-state";
import { ApplicationError } from "./error-model";

export class ErrorBoundary extends React.Component<{}, { error?: Error }> {
  static getDerivedStateFromError(error: Error) {
    console.warn("derived state from error", error);
    return { error, hasError: true };
  }

  constructor(props: {}) {
    super(props);
    this.state = { error: undefined };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn(error);
    console.warn(errorInfo);
  }

  render() {
    return (
      <>
        {/*
        <GlobalErrorHandler />
        {this.state.hasError && <p>I saw there is at least one error...</p>}
        {this.props.children}
        <ErrorAlert
          error={this.state.error}
          dismissError={() => this.setState({ error: undefined })}
        />
        */}
        {this.state.error ? <>BOOM!</> : <>{this.props.children}</>}
      </>
    );
  }
}

const GlobalErrorHandler = () => {
  const dismissError = useDismissError();
  const { nextError, errorCount } = useErrorState();
  return (
    <ErrorAlert error={nextError} dismissError={dismissError} errorCount={errorCount} />
  );
};

const ErrorAlert = (props: {
  error?: ApplicationError;
  dismissError: () => void;
  errorCount?: number;
}) => {
  return (
    <Alert
      isOpen={!!props.error}
      intent="danger"
      confirmButtonText="Dismiss"
      onConfirm={() => props.dismissError()}
      icon="error"
      className="bp3-dark"
    >
      <p>{props.error?.toString()}</p>
      {props.errorCount !== undefined ? <p>{props.errorCount} errors</p> : null}
    </Alert>
  );
};
