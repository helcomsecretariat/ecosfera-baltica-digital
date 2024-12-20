import Resources from "./locale.d";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: Resources;
  }
}
