import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * A functional component that scrolls the window to the top
 * whenever the route (pathname) changes.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
};

export default ScrollToTop;