export type UseCaseSuccess<TData> = {
  ok: true;
  data: TData;
};

export type UseCaseFailure<TError extends { code: string; message: string }> = {
  ok: false;
  error: TError;
};

export type UseCaseResult<
  TData,
  TError extends { code: string; message: string },
> = UseCaseSuccess<TData> | UseCaseFailure<TError>;
