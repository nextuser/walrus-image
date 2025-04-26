'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { networkConfig, network } from "@/contracts"
import "@mysten/dapp-kit/dist/index.css";
import { ConnectButton } from "@mysten/dapp-kit";
import { StorageProvider } from "./storage_provider";

const queryClient = new QueryClient();
export function Providers({ children }: { children: React.ReactNode }) {

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork='testnet'>
        <WalletProvider>
            <StorageProvider>
              {children}
            </StorageProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
