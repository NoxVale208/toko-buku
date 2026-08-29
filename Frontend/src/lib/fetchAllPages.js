import api from "./api";

/**
 * Fetches every page of a Laravel-paginated endpoint and concatenates the results.
 * Use only for consumers that genuinely need the FULL dataset (aggregate stats,
 * picker dropdowns) — not for browsable list UIs, which should use real
 * server-side pagination (page/meta) instead.
 */
export async function fetchAllPages(endpoint, params = {}) {
  let page = 1;
  let all = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await api.get(endpoint, { params: { ...params, page } });
    const payload = res.data.data;
    // Laravel paginated resource collection: { data: [...], meta: {...} }
    // Some raw (non-Resource) paginators nest differently: { data: { data: [...], next_page_url } }
    const items = Array.isArray(payload) ? payload : payload?.data ?? [];
    all = all.concat(items);

    const hasNext = res.data.links?.next ?? payload?.next_page_url ?? null;
    if (!hasNext) break;
    page++;
  }
  return all;
}
