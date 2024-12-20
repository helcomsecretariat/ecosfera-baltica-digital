import { useGameState } from "@/context/game-state/hook";
import { TurnMachine } from "@/state/machines/turn";
import { button, useControls } from "leva";
import { SnapshotFrom } from "xstate";

export const useTestControls = () => {
  const { actorRef, emit } = useGameState();

  return useControls("Testing", {
    ["State to clipboard 📋"]: button(() => {
      const snap = actorRef.getPersistedSnapshot() as SnapshotFrom<typeof actorRef>;
      snap.context.ui = undefined;
      navigator.clipboard.writeText(JSON.stringify(snap));
    }),

    ["State from clipboard"]: button(async () => {
      try {
        const clipboard = await navigator.clipboard.readText();
        const snap = JSON.parse(clipboard) as SnapshotFrom<typeof TurnMachine>;
        const ctx = snap.context ?? snap; // some data sniffing

        // machine will calculate ui and state from context
        ctx.ui = undefined;
        emit.iddqd(ctx)();
      } catch (e) {
        console.error(e);
        alert("Something went wrong.");
      }
    }),

    isLoggingEvents: {
      label: "Event log",
      value: false,
      onChange: (value) => {
        emit.iddqd({ isLoggingEvents: value })();
      },
    },

    isStageAutoConfirm: {
      label: "Auto OK",
      value: false,
      onChange: (value) => {
        emit.iddqd({ isStageAutoConfirm: value })();
      },
    },
  });
};
