export function calculateOffsetAndLimit(
  total: number,
  start: number,
  end?: number,
): { offset: number; limit: number } | null {
  if (start < 0 || (end && end < 0)) {
    if (start < 0) {
      start = Math.max(total + start, 0);
    }

    if (end && end < 0) {
      end = Math.max(total + end, 0);
    }
  }

  if (start === end) {
    return null;
  }

  const offset = start;

  let limit = -1;

  if (typeof end === 'undefined') {
    limit = -1;
  } else if (end - start > 0) {
    limit = end - start;
  } else {
    return null;
  }

  return { offset, limit };
}
