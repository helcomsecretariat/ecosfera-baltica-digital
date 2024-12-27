import { useEffect, useState } from "react";

export const isDebugging =
  typeof window !== "undefined" ? new URLSearchParams(window.location.search).has("debug") : false;

export const useDebugMode = () => {
  const [isDebugMode, setIsDebugMode] = useState(isDebugging);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    setIsDebugMode(params.has("debug"));

    const handleUrlChange = () => {
      const newParams = new URLSearchParams(window.location.search);
      setIsDebugMode(newParams.has("debug"));
    };

    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, []);

  return isDebugMode;
};
