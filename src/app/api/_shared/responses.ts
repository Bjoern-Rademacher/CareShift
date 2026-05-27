export const METHOD_NOT_ALLOWED = () =>
  Response.json({ error: "Method not allowed" }, { status: 405 });
