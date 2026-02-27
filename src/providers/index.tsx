import PageLoad from "@/components/custom/page-load";
import { MainErrorFallback } from "@/components/error";
import { queryClient } from "@/config/constants";
import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "sonner";
import AntDConfig from "./antd-config";

interface Props {
  children: React.ReactNode;
}

const Provider = ({ children }: Props) => {
  return (
    <Suspense fallback={<PageLoad />}>
      <ErrorBoundary FallbackComponent={MainErrorFallback}>
        <Toaster richColors closeButton position="top-right" />
        <QueryClientProvider client={queryClient}>
          <AntDConfig>{children}</AntDConfig>
        </QueryClientProvider>
      </ErrorBoundary>
    </Suspense>
  );
};
export default Provider;
