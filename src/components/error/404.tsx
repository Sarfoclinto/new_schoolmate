import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "antd";
import { MoveLeft, Home } from "lucide-react";
import { getUserDashboardRoute } from "@/utils/string";

const Page404 = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dashboardRoute = getUserDashboardRoute();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="relative flex justify-center">
          <img
            src="/unknown.svg"
            alt="404 Not Found"
            className="w-64 h-64 md:w-80 md:h-80 animate-pulse"
          />
        </div>

        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800">404</h1>
          <h2 className="text-2xl md:text-xl font-semibold">Lost in Space?</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <div className="inline-block px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20">
            <code className="text-red-400 text-sm font-mono">{pathname}</code>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            size="large"
            icon={<MoveLeft size={18} />}
            onClick={() => navigate(-1)}
            className="min-w-[160px] h-12 flex items-center justify-center gap-2 border-slate-700 text-slate-300 hover:text-white hover:border-white bg-transparent"
          >
            Go Back
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<Home size={18} />}
            onClick={() => navigate(dashboardRoute)}
            className="min-w-[160px] h-12 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 border-none"
          >
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page404;
