// MaterialProvider.tsx

import { createContext, ReactNode, useMemo } from "react";
import {
  Material,
  MeshBasicMaterial,
  MeshBasicMaterialParameters,
  MeshStandardMaterial,
  MeshStandardMaterialParameters,
} from "three";
import { ExtendedColors, NodeProps, Overwrite } from "@react-three/fiber";

type MaterialPropsStandard = ExtendedColors<
  Overwrite<Partial<MeshStandardMaterial>, NodeProps<MeshStandardMaterial, [MeshStandardMaterialParameters]>>
>;
type MaterialPropsBasic = ExtendedColors<
  Overwrite<Partial<MeshBasicMaterial>, NodeProps<MeshBasicMaterial, [MeshBasicMaterialParameters]>>
>;
type MaterialProps<T extends boolean> = T extends true ? MaterialPropsStandard : MaterialPropsBasic;

type MaterialContextType = {
  RelevantMaterial: <T extends boolean>(props: MaterialProps<T>) => JSX.Element;
  lightProps?: Partial<MeshStandardMaterial>;
  getRelevantMaterial: <T extends boolean>(props?: MaterialProps<T>) => Material;
};

export const MaterialContext = createContext<MaterialContextType | undefined>(undefined);

export const MaterialProvider = ({ isGlossy, children }: { isGlossy: boolean; children: ReactNode }) => {
  const lightProps = isGlossy ? ({ metalness: 0.8, roughness: 0.4 } as Partial<MeshStandardMaterial>) : {};

  const getRelevantMaterial = useMemo(
    () =>
      <T extends boolean>(props?: MaterialProps<T>): Material => {
        if (isGlossy) {
          return new MeshStandardMaterial({
            ...(lightProps as MeshStandardMaterialParameters),
            ...(props as MeshStandardMaterialParameters),
          });
        } else {
          return new MeshBasicMaterial({ ...(props as MeshBasicMaterialParameters) });
        }
      },
    [isGlossy, lightProps],
  );

  const RelevantMaterial = <T extends boolean>(props: MaterialProps<T>) => {
    return isGlossy ? (
      <meshStandardMaterial
        {...{
          ...lightProps,
          ...(props as MaterialPropsStandard),
        }}
      />
    ) : (
      <meshBasicMaterial {...(props as MaterialPropsBasic)} />
    );
  };
  return (
    <MaterialContext.Provider value={{ RelevantMaterial, lightProps, getRelevantMaterial }}>
      {children}
    </MaterialContext.Provider>
  );
};
