export type CommonApiErrorCode =
  | "INVALID_JSON"
  | "INVALID_INPUT"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INTERNAL_ERROR";

export type ApiIssue = {
  code: string;
  message: string;
  field?: string;
};

export type ApiSuccessResponse<TData> = {
  ok: true;
  data: TData;
};

export type ApiErrorResponse<
  TFeatureErrorCode extends string = never,
  TErrorDetails extends object = never,
> = {
  ok: false;
  error: {
    code: CommonApiErrorCode | TFeatureErrorCode;
    message: string;
    issues?: ApiIssue[];
    details?: TErrorDetails;
  };
};

export type ApiResponse<
  TData,
  TFeatureErrorCode extends string = never,
  TErrorDetails extends object = never,
> =
  | ApiSuccessResponse<TData>
  | ApiErrorResponse<TFeatureErrorCode, TErrorDetails>;
