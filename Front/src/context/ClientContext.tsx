import React, { createContext, useContext, useState } from 'react';
import type { Client } from '../modules/clientes/dialog/index';

type ClientContextType = {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
};

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  return (
    <ClientContext.Provider value={{ clients, setClients }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClients() {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error('useClients must be used within a ClientProvider');
  return ctx;
}
