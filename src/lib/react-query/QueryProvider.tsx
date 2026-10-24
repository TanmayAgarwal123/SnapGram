import { ReactNode } from "react";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
  MutationCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { toast } from "@/components/ui/use-toast";
import { getErrorMessage } from "@/lib/appwrite/errors";

// Surface every failed query/mutation as a toast so nothing fails silently.
// Individual callers can still add their own onError for bespoke handling.
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast({ variant: "destructive", title: getErrorMessage(error) });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      toast({ variant: "destructive", title: getErrorMessage(error) });
    },
  }),
  defaultOptions: {
    queries: {
      // Sensible defaults for a social feed: keep data reasonably fresh while
      // avoiding a refetch storm on every window focus.
      staleTime: 1000 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};
