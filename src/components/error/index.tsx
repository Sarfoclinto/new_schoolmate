import type { FallbackProps } from "react-error-boundary";
import { useLocation } from "react-router-dom";
export const MainErrorFallback = ({
  error,
  resetErrorBoundary,
}: FallbackProps) => {
  const { pathname } = useLocation();
  return (
    <div
      className="flex h-screen w-screen flex-col items-center justify-center"
      role="alert"
    >
      <h2 className="text-lg font-semibold">Ooops, something went wrong :( </h2>
      <p className="text-red-500">
        {String(error)} on page {pathname}
      </p>
      <div className="w-1/3 flex items-center gap-2">
        <button
          className="mt-4 px-5 py-1.5 rounded cursor-pointer transition duration-150 active:scale-95 bg-slate-950 text-white font-medium"
          onClick={() => window.location.assign(window.location.origin)}
        >
          Refresh
        </button>
        <button
          className="mt-4 px-5 py-1.5 rounded cursor-pointer transition duration-150 active:scale-95 bg-slate-950 text-white font-medium"
          onClick={() => resetErrorBoundary()}
        >
          Reset
        </button>
      </div>
    </div>
  );
};
