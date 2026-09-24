import { QueryClient } from "@tanstack/react-query";

/** Shared query client. Data is local (Rust/git), so keep it fresh but cached. */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });
}
