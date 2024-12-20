import { useEffect } from "react";
import i18n from "@/i18n";

type UseBlockerOptions = {
  when?: boolean;
  message?: string;
};

export function useBlocker({ when = true, message = i18n.t("blocker.leavePageMessage") }: UseBlockerOptions = {}) {
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
