import { useEffect } from "react";

type UseBlockerOptions = {
  when?: boolean;
  message?: string;
};

export function useBlocker({
  when = true,
  message = "Are you sure you want to leave this page?",
}: UseBlockerOptions = {}) {
  useEffect(() => {
    if (!when) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // For most browsers
      event.returnValue = message;
      // For Chrome
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [when, message]);
}
