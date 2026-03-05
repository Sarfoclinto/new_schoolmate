import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "@/styles/antd-theme.css";

// INFO: Prevent app from running without APP_CONFIG
// if (!window.__APP_CONFIG__) {
//   throw new Error("Runtime config not found. Make sure config.js is loaded.");
// }

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
