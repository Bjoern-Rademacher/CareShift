import type { ApiErrorResponse } from "@/types/api";

type ParseJsonResult =
  | {
      ok: true;
      data: unknown;
    }
  | {
      ok: false;
      response: Response;
    };

export async function parseJsonBody(
  request: Request,
): Promise<ParseJsonResult> {
  try {
    const data: unknown = await request.json();

    return {
      ok: true,
      data,
    };
  } catch {
    const error = {
      ok: false,
      error: {
        code: "INVALID_JSON",
        message: "Request body must contain valid JSON.",
      },
    } satisfies ApiErrorResponse;

    return {
      ok: false,
      response: Response.json(error, { status: 400 }),
    };
  }
}
