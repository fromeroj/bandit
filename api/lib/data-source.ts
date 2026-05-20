/**
 * Wrapper for calling data source APIs dynamically
 */
export async function get_data_source(
  _data_source_name: string,
  _api_name: string,
  _params: Record<string, unknown>
): Promise<unknown> {
  // This will be resolved at runtime by the backend's data source system
  // For now, return mock data structure
  return { data: [], error: null };
}
