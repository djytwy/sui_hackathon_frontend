"use client";

import { useEffect, useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import {
  useSuiClient,
  useCurrentAccount,
  useDisconnectWallet,
} from "@mysten/dapp-kit";
import { useEnokiFlow, useZkLogin } from "@mysten/enoki/react";
import { ExternalLink, LoaderCircle } from "lucide-react";
import { track } from "@vercel/analytics";
import ConnectedPage from "@/components/connectedPage";
import { NotConnectPage } from "@/components/notConnectPage";
import { OptionsCard } from "@/components/options";

export default function Page() {
  const client = useSuiClient(); // The SuiClient instance
  const enokiFlow = useEnokiFlow(); // The EnokiFlow instance
  const { address: suiAddress } = useZkLogin(); // The zkLogin instance
  const account = useCurrentAccount();

  /* The account information of the current user. */
  const [balance, setBalance] = useState<number>(0);
  const [accountLoading, setAccountLoading] = useState<boolean>(true);

  /* Transfer form state */
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [transferLoading, setTransferLoading] = useState<boolean>(false);

  const [optionType, setOptionType] = useState<"Mint" | "Redeem">("Mint");

  /** Mint info  */
  const [MintNum, setMintNum] = useState<number>(0);
  const [USDCBalance, setUSDCBalance] = useState<string>("0");
  const [EnterNum, setEnterNum] = useState<string>("");
  const [Fee, setFee] = useState<string>("0 USDC");

  /** sum info */
  const [APY, setAPY] = useState<number>();
  const [TVL, setTVL] = useState();

  useEffect(() => {
    if (optionType === "Mint") {
      setFee("0 USDC");
    } else {
      setFee(
        parseFloat(EnterNum) > 0
          ? `${(parseFloat(EnterNum) * 0.0005).toFixed(4)} CUSD`
          : "0 CUSD",
      );
    }
  }, [EnterNum]);

  if (suiAddress || account) {
    return <ConnectedPage></ConnectedPage>;
  } else {
    return <NotConnectPage></NotConnectPage>;
  }
}
