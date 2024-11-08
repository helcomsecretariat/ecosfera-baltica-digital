// proj/ecosfera/src/utils/withMaterialProvider.tsx

import React from "react";
import { MaterialProvider } from "@/components/MaterialProvider/provider";

type WithMaterialProviderProps = {
  isGlossy?: boolean;
};

const withMaterialProvider = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
): React.FC<P & WithMaterialProviderProps> => {
  return ({ isGlossy = false, ...props }: WithMaterialProviderProps & P) => (
    <MaterialProvider isGlossy={isGlossy}>
      <WrappedComponent {...(props as P)} />
    </MaterialProvider>
  );
};

export default withMaterialProvider;
