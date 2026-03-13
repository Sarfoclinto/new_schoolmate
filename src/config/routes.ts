import adminPaths from "./admin.routes";
import staffPaths from "./staff.routes";

const paths = {
  public: {
    index: { href: "/", label: "Home" },
    unknown: {
      href: "/unknown",
      redirect: (reason: string) =>
        `/unknown?reason=${encodeURIComponent(reason)}`,
      label: "Unknown",
    },
    unauthorized: {
      href: "/unauthorized",
      redirect: (reason: string) =>
        `/unauthorized?reason=${encodeURIComponent(reason)}`,
      label: "unauthorized",
    },
    "404": {
      href: "*",
      label: "404",
      redirect: (from: string) => `*?from=${from}`,
    },
  },
  auth: {
    login: { href: "/login", label: "Login" },
  },
  admin: adminPaths,
  staff: staffPaths,
};

export default paths;
