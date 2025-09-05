import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";

function Fallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-left">
      <div className="max-w-xl w-full border rounded-md p-4 bg-card">
        <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
        <pre className="text-sm whitespace-pre-wrap text-red-400 mb-4">{error.message}</pre>
        <Button onClick={resetErrorBoundary}>Reload</Button>
      </div>
    </div>
  );
}

export default function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={Fallback} onReset={() => window.location.reload()}>
      {children}
    </ErrorBoundary>
  );
}