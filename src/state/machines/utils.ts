// import { createBrowserInspector } from "@statelyai/inspect";
// const inspector = createBrowserInspector();
// const xStateInspector = inspector.inspect;

import { TurnMachineContext } from "@/state/machines/turn";
import { InspectionEvent } from "xstate";

const xStateInspector = undefined;

// let inspect: (inspectionEvent: InspectionEvent) => void = () => {};

// if (process.env.NODE_ENV !== "production") {
//   import("@statelyai/inspect")
//     .then(({ createBrowserInspector }) => {
//       const inspector = createBrowserInspector();
//       //@ts-expect-error doesnt matter
//       inspect = inspector.inspect;
//     })
//     .catch((error) => {
//       console.error("Failed to load inspector:", error);
//     });
// }

function eventLogger(inspectionEvent: InspectionEvent) {
  if (inspectionEvent.type === "@xstate.event") {
    const event = inspectionEvent.event;
    const { isLoggingEvents } = inspectionEvent.actorRef.getSnapshot().context as TurnMachineContext;
    const isInternalEvent = event.type.startsWith("xstate.");

    if (!isLoggingEvents || isInternalEvent) {
      return;
    }

    console.info(event);
  }
}

export { xStateInspector, eventLogger };
