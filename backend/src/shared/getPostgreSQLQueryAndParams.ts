export function getPostgreSQLQueryAndParams(
  query: string,
  params: Record<string, unknown>,
): { query: string; params: unknown[] } {
  let trasformedQuery = query;
  const trasformedParams: unknown[] = [];

  for (const key of Object.keys(params)) {
    if (!trasformedQuery.includes(key)) {
      continue;
    }

    trasformedQuery = trasformedQuery.replaceAll(
      key,
      `$${trasformedParams.length + 1}`,
    );
    trasformedParams.push(params[key]);
  }

  return { query: trasformedQuery, params: trasformedParams };
}
