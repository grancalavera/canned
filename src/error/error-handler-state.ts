import create, { State } from "zustand";
import shallow from "zustand/shallow";
import { ApplicationError } from "./error-model";

interface ErrorHandlerState extends State, ErrorState, ErrorHandler {}

interface ErrorState {
  errors: ApplicationError[];
  errorCount: number;
  nextError?: ApplicationError;
}

interface ErrorHandler {
  handleError: (error: ApplicationError) => void;
  dismissError: (dismissAll?: boolean) => void;
}

const useErrorHandlerState = create<ErrorHandlerState>((set) => ({
  errors: [],
  errorCount: 0,
  handleError: (error: ApplicationError) =>
    set((state) => {
      const errors = handleError(error, state.errors);
      return { ...deriveErrorState(errors) };
    }),
  dismissError: (dismissAll = false) =>
    set((state) => {
      const errors = dismissError(dismissAll, state.errors);
      return { ...deriveErrorState(errors) };
    }),
}));

export const useErrorHandler = () => useErrorHandlerState((s) => s.handleError);

export const useDismissError = () => useErrorHandlerState((s) => s.dismissError);

export const useErrorState = (): ErrorState =>
  useErrorHandlerState(
    ({ errors, nextError, errorCount }) => ({
      errors,
      nextError,
      errorCount,
    }),
    shallow
  );

const handleError = (
  error: ApplicationError,
  errors: ApplicationError[] = []
): ApplicationError[] => [...errors, error];

const dismissError = (
  dismissAll: boolean,
  [, ...errors]: ApplicationError[] = []
): ApplicationError[] => (dismissAll ? [] : errors);

const deriveErrorState = (errors: ApplicationError[]): ErrorState => ({
  errors,
  errorCount: errors.length,
  nextError: errors[0],
});
