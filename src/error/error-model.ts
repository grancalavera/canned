import { RequestError as OctokitRequestError } from "@octokit/types";

export type AppError = OctokitRequestError | CustomError | UnknownError;

interface UnknownError {
  kind: "UnknownError";
  error: unknown;
}

interface CustomError {
  kind: "CustomError";
  name: string;
  message: string;
}

export type CustomErrorProps = Omit<CustomError, "kind">;

export const customError = (options: CustomErrorProps): AppError => ({
  kind: "CustomError",
  ...options,
});

export const unknownError = (error: unknown): AppError => ({
  kind: "UnknownError",
  error,
});

export const isRequestError = (error: AppError): error is OctokitRequestError => {
  const unsafeError = error as any;

  return (
    typeof unsafeError.name === "string" &&
    typeof unsafeError.status === "number" &&
    typeof unsafeError.documentation_url === "string" &&
    Array.isArray(unsafeError.errors ?? [])
  );
};
