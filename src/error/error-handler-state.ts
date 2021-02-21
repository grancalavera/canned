import create, { State } from "zustand";
import shallow from "zustand/shallow";
import { AppError, customError, CustomErrorProps, unknownError } from "./error-model";

interface ErrorHandlerState extends State, ErrorState, ErrorHandler {}

interface ErrorState {
  errors: AppError[];
  errorCount: number;
  nextError?: AppError;
}

interface ErrorHandler {
  handleError: (error: AppError) => void;
  dismissError: (dismissAll?: boolean) => void;
}

const useErrorHandlerState = create<ErrorHandlerState>((set) => ({
  errors: [],
  errorCount: 0,
  handleError: (error: AppError) =>
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

export const useRaiseCustomError = () => {
  const handleError = useErrorHandler();
  return (options: CustomErrorProps) => handleError(customError(options));
};

export const useRaiseUnknownError = () => {
  const handleError = useErrorHandler();
  return (error: unknown) => handleError(unknownError(error));
};

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

const handleError = (error: AppError, errors: AppError[] = []): AppError[] => [
  ...errors,
  error,
];

const dismissError = (dismissAll: boolean, [, ...errors]: AppError[] = []): AppError[] =>
  dismissAll ? [] : errors;

const deriveErrorState = (errors: AppError[]): ErrorState => ({
  errors,
  errorCount: errors.length,
  nextError: errors[0],
});
