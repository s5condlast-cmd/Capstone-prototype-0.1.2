"use client";

import { useEffect } from "react";
import { useTheme } from "./ThemeContext";

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { darkMode } = useTheme();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return <>{children}</>;
}
