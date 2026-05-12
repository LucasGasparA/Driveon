import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  defaultAdditionalResources,
  obterRecursosAdicionais,
  salvarRecursosAdicionais,
  type AdditionalResourceKey,
  type AdditionalResourcesMap,
} from "../modules/recursos-adicionais/api/api";

type AdditionalResourcesContextType = {
  resources: AdditionalResourcesMap;
  loading: boolean;
  isEnabled: (resource: AdditionalResourceKey) => boolean;
  refresh: () => Promise<void>;
  save: (resources: AdditionalResourcesMap) => Promise<AdditionalResourcesMap>;
};

const AdditionalResourcesContext = createContext<AdditionalResourcesContextType>({} as AdditionalResourcesContextType);

export function AdditionalResourcesProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [resources, setResources] = useState<AdditionalResourcesMap>(defaultAdditionalResources);
  const [loading, setLoading] = useState(false);

  const refresh = React.useCallback(async () => {
    if (!isAuthenticated) {
      setResources(defaultAdditionalResources);
      return;
    }

    setLoading(true);
    try {
      setResources(await obterRecursosAdicionais());
    } catch {
      setResources(defaultAdditionalResources);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = React.useCallback(async (next: AdditionalResourcesMap) => {
    const saved = await salvarRecursosAdicionais(next);
    setResources(saved);
    return saved;
  }, []);

  const value = useMemo(
    () => ({
      resources,
      loading,
      isEnabled: (resource: AdditionalResourceKey) => resources[resource],
      refresh,
      save,
    }),
    [loading, refresh, resources, save]
  );

  return <AdditionalResourcesContext.Provider value={value}>{children}</AdditionalResourcesContext.Provider>;
}

export const useAdditionalResources = () => useContext(AdditionalResourcesContext);
