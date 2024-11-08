import { MaterialContext } from "@/components/MaterialProvider/provider";
import { useContext } from "react";

export const useRelevantMaterial = () => {
  const context = useContext(MaterialContext);
  if (!context) {
    throw new Error("useRelevantMaterial must be used within a MaterialProvider");
  }
  return context;
};
