import type { ResultSet } from "./types";

/**
 * Published results. Empty until real rounds are adjudicated — standings are
 * never fabricated. The results surfaces render their empty states until the
 * first room closes.
 */
export const resultSets: ResultSet[] = [];
