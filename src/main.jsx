import "@fontsource-variable/geist";
import "@fontsource/six-caps";
import { MotionConfig } from "framer-motion";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { loadHumane } from "./lib/fonts";
import { applyInitialTheme } from "./lib/theme";
import { router } from "./Routes/Root";

loadHumane();
applyInitialTheme();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Honour the OS "reduce motion" setting across every animation */}
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  </React.StrictMode>
);
