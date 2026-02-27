import { Navigate, useSearchParams } from "react-router-dom";
import Section from "../custom/section";
import { AlertOctagonIcon } from "lucide-react";
import { useAuth } from "@/store/auth.store";
import { DEFAULT_ROLES } from "@/config/constants";
import { getUserDashboardRoute } from "@/utils/string";

const UnknownPage = () => {
  const [searchParams] = useSearchParams();
  const role = useAuth((s) => s.user?.role) ?? "unknown";
  const allRoles = [DEFAULT_ROLES.ADMIN, DEFAULT_ROLES.STAFF].flat();

  if (allRoles.includes(role.toLowerCase())) {
    return <Navigate to={getUserDashboardRoute()} replace />;
  }

  const reason = searchParams.get("reason");
  const path = window.location.pathname;

  return (
    <div className="w-dvw h-dvh flex flex-col items-center justify-center bg-slate-950 text-white">
      <p className="text-lg font-medium text-slate-400">Something went wrong</p>

      <pre className="text-destructive px-10 py-2 rounded-lg bg-red-800/20 my-3">
        On Page: <span className="font-mono">"{path}"</span>
      </pre>

      <Section
        title={"Report this issue"}
        icon={<AlertOctagonIcon className="text-destructive" />}
        collapsible
        className="min-w-3/5 border-red-500"
        btnClassName="border-b-red-500"
        titleClassName="text-red-500"
      >
        {!!reason && (
          <pre className="px-10 py-2 rounded-lg bg-slate-800/40 text-slate-400 max-w-[90%]. overflow-auto mt-3 text-xs">
            {reason}
          </pre>
        )}
      </Section>
    </div>
  );
};
export default UnknownPage;
