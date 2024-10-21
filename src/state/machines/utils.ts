// import { createBrowserInspector } from "@statelyai/inspect";
// const inspector = createBrowserInspector();
// const inspect = inspector.inspect;
const inspect = undefined;

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

export { inspect };
