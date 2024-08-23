"use client";

import { useEffect, useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import {
  useSuiClient,
  useCurrentAccount,
  useDisconnectWallet,
} from "@mysten/dapp-kit";
import { useEnokiFlow, useZkLogin } from "@mysten/enoki/react";
import { getFaucetHost, requestSuiFromFaucetV0 } from "@mysten/sui/faucet";
import { ExternalLink, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ShowTable from "@/components/table";
import { toast } from "sonner";
import { BalanceChange } from "@mysten/sui/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { track } from "@vercel/analytics";
import ConnectSUIButton from "@/components/connectSUIButton";

export function NotConnectPage() {
  const client = useSuiClient(); // The SuiClient instance
  const enokiFlow = useEnokiFlow(); // The EnokiFlow instance
  const { address: suiAddress } = useZkLogin(); // The zkLogin instance

  const startLogin = async () => {
    const promise = async () => {
      window.location.href = await enokiFlow.createAuthorizationURL({
        provider: "google",
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        redirectUrl: `${window.location.origin}/auth`,
        network: "testnet",
      });
    };

    toast.promise(promise, {
      loading: "Loggin in...",
    });
  };

  return (
    <div className="flex flex-col items-center justify-start">
      <div>
        <h1 className="text-4xl font-bold m-4">Collepreax</h1>
      </div>
      <Button onClick={startLogin}>Sign in with Google</Button>
      <ConnectSUIButton></ConnectSUIButton>
    </div>
  );
}
