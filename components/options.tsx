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
import SildeButton from "@/components/slideButton";
import Tvl from "@/components/Tvl";

export function OptionsCard({ cb }: { cb: (v: "Mint" | "Redeem") => void }) {
  const [optionType, setOptionType] = useState("Mint");
  const [EnterNum, setEnterNum] = useState<string>("");

  return (
    <Card className="w-[480px]">
      <CardHeader>
        <SildeButton
          active="Mint"
          wordsList={["Mint", "Redeem"]}
          device="pc"
          onChange={(active: string) => {
            setOptionType(active as "Mint" | "Redeem");
            setEnterNum("");
            cb(active as "Mint" | "Redeem");
          }}
          className="mb-6"
        ></SildeButton>
        <CardTitle>{optionType} CUSD</CardTitle>
        <CardDescription>
          {optionType === "Mint"
            ? `This way will mint CUSD you can get interest just hold the CUSD.`
            : `This way will redeem CUSD to USDC.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="mintNum">
            Please enter {optionType.toLocaleLowerCase()} number
          </Label>
          <Input
            type="number"
            id="enterNum"
            placeholder={`${optionType} number`}
            value={EnterNum}
            onChange={(e) => setEnterNum(e.target.value)}
          />
        </div>
        {optionType === "Mint" ? (
          <MintInfo enterNum={EnterNum}></MintInfo>
        ) : (
          <RedeemInfo enterNum={EnterNum}></RedeemInfo>
        )}
      </CardContent>
      <CardFooter className="w-full flex flex-row items-center justify-center">
        {optionType === "Mint" ? (
          <Button
            onClick={() => { }}
            disabled={EnterNum === ""}
            className="w-full"
          >
            Mint
          </Button>
        ) : (
          <Button
            onClick={() => { }}
            disabled={EnterNum === ""}
            className="w-full"
          >
            Redeem
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function MintInfo({ enterNum }: { enterNum: string }) {
  const [USDCBalance, setUSDCBalance] = useState<number>(0);
  const client = useSuiClient(); // The SuiClient instance
  const { mutate: disconnect } = useDisconnectWallet();
  const account = useCurrentAccount();
  const { address: zkSuiAddress } = useZkLogin(); // The zkLogin instance

  const getUSDCWithOutZK = async () => {
    if (!account) {
      return;
    }
    const USDCBalance = await client.getBalance({
      owner: account.address,
      coinType:
        "0x20a1afd205d76952d37608f6af6707c4f2271ba45b161cb08734556a30cde9f9::USDC::USDC",
    });
    setUSDCBalance(parseInt(USDCBalance.totalBalance) / 1000000);
  };

  const getUSDCWithZK = async () => {
    if (!zkSuiAddress) {
      return;
    }
    const USDCBalance = await client.getBalance({
      owner: zkSuiAddress,
      coinType:
        " 0x20a1afd205d76952d37608f6af6707c4f2271ba45b161cb08734556a30cde9f9::USDC::USDC",
    });
    setUSDCBalance(parseInt(USDCBalance.totalBalance) / 1000000);
  };

  useEffect(() => {
    getUSDCWithOutZK();
    getUSDCWithZK();
  }, [zkSuiAddress, account]);

  return (
    <>
      <div className="flex justify-between items-center text-sm">
        <p>Your USDC balance:</p>
        <div className="flex items-center gap-x-2">
          <p>{USDCBalance}</p>
          <div className="font-bold cursor-pointer">Max</div>
        </div>
      </div>
      <div className="flex justify-between items-center text-sm">
        <p>Mint Fee (0%): </p>
        <p>0 USDC</p>
      </div>
      <div className="flex justify-between items-center text-sm">
        <p>You will get CUSD:</p>
        <p>{enterNum === "" ? "0" : enterNum} CUSD</p>
      </div>
    </>
  );
}

function RedeemInfo({ enterNum }: { enterNum: string }) {
  const [CUSDBalance, setCUSDBalance] = useState();
  const [Fee, setFee] = useState<string>("0 CUSD");

  useEffect(() => {
    setFee(
      parseFloat(enterNum) > 0
        ? `${(parseFloat(enterNum) * 0.0005).toFixed(4)} CUSD`
        : "0 CUSD",
    );
  }, [enterNum]);

  return (
    <>
      <div className="flex justify-between items-center text-sm">
        <p>Your CUSD balance:</p>
        <div className="flex items-center gap-x-2">
          <p>{CUSDBalance}</p>
          <div className="font-bold cursor-pointer">Max</div>
        </div>
      </div>
      <div className="flex justify-between items-center text-sm">
        <p>Redeem Fee 0.05% :</p>
        <p>{Fee}</p>
      </div>
      <div className="flex justify-between items-center text-sm">
        <p>You will get USDC:</p>
        <p>{`${enterNum ? (parseFloat(enterNum) * 0.9995).toFixed(4) : "0"} CUSD`}</p>
      </div>
    </>
  );
}
