"use client";

import { QueryClient, QueryClientProvider as TanStackQueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

export function QueryClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TanStackQueryClientProvider client={queryClient}>{children}</TanStackQueryClientProvider>
  );
}

