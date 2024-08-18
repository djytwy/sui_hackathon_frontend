"client";
import { EnokiFlowProvider } from "@mysten/enoki/react";
import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@mysten/dapp-kit/dist/index.css";

// Config options for the networks you want to connect to
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
});

const queryClient = new QueryClient();

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <EnokiFlowProvider apiKey={process.env.NEXT_PUBLIC_API_KEY!}>
          <WalletProvider autoConnect>{children}</WalletProvider>
        </EnokiFlowProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
