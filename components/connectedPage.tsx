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
import { OptionsCard } from "./options";
import { useSignInContext } from "@/app/ctx";

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

  /** Mint info  */
  const [MintNum, setMintNum] = useState<number>(0);
  const [USDCBalance, setUSDCBalance] = useState<string>("0");
  const [EnterNum, setEnterNum] = useState<string>("");
  const [Fee, setFee] = useState<string>("0 USDC");

  const { activeTab, setActiveTab } = useSignInContext();

  /** sum info */
  const [APY, setAPY] = useState<number>();
  const [TVL, setTVL] = useState();

  useEffect(() => {
    if (activeTab === "Mint") {
      setFee("0 USDC");
    } else {
      setFee(
        parseFloat(EnterNum) > 0
          ? `${(parseFloat(EnterNum) * 0.0005).toFixed(4)} CUSD`
          : "0 CUSD",
      );
    }
  }, [EnterNum]);

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

  /**
   * Transfer SUI to another account. This transaction is not sponsored by the app.
   */
  async function transferSui() {
    const promise = async () => {
      track("Transfer SUI");

      setTransferLoading(true);

      // Validate the transfer amount
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) {
        setTransferLoading(false);
        throw new Error("Invalid amount");
      }

      // Get the keypair for the current user.
      const keypair = await enokiFlow.getKeypair({ network: "testnet" });

      // Create a new transaction block
      const txb = new Transaction();

      // Add some transactions to the block...
      const [coin] = txb.splitCoins(txb.gas, [
        txb.pure.u64(parsedAmount * 10 ** 9),
      ]);
      txb.transferObjects([coin], txb.pure.address(recipientAddress));

      // Sign and execute the transaction block, using the Enoki keypair
      const res = await client.signAndExecuteTransaction({
        signer: keypair,
        transaction: txb,
        options: {
          showEffects: true,
          showBalanceChanges: true,
        },
      });

      setTransferLoading(false);

      console.log("Transfer response", res);

      if (res.effects?.status.status !== "success") {
        const suiBalanceChange =
          res.balanceChanges
            ?.filter((balanceChange: BalanceChange) => {
              return balanceChange.coinType === "0x2::sui::SUI";
            })
            .map((balanceChange: BalanceChange) => {
              return parseInt(balanceChange.amount) / 10 ** 9;
            })
            .reduce((acc: number, change: any) => {
              if (change.coinType === "0x2::sui::SUI") {
                return acc + parseInt(change.amount);
              }
              return acc;
            }) || 0;
        setBalance(balance - suiBalanceChange);
        throw new Error(
          "Transfer failed with status: " + res.effects?.status.error,
        );
      }

      return res;
    };

    toast.promise(promise, {
      loading: "Transfer SUI...",
      success: (data) => {
        const suiBalanceChange =
          data.balanceChanges
            ?.filter((balanceChange: BalanceChange) => {
              return balanceChange.coinType === "0x2::sui::SUI";
            })
            .map((balanceChange: BalanceChange) => {
              return parseInt(balanceChange.amount) / 10 ** 9;
            })
            .reduce((acc: number, change: any) => {
              if (change.coinType === "0x2::sui::SUI") {
                return acc + parseInt(change.amount);
              }
              return acc;
            }) || 0;
        setBalance(balance - suiBalanceChange);

        return (
          <span className="flex flex-row items-center gap-2">
            Transfer successful!{" "}
            <a
              href={`https://suiscan.xyz/testnet/tx/${data.digest}`}
              target="_blank"
            >
              <ExternalLink width={12} />
            </a>
          </span>
        );
      },
      error: (error) => {
        return error.message;
      },
    });
  }

  /**
   * Increment the global counter. This transaction is sponsored by the app.
   */
  async function incrementCounter() {
    const promise = async () => {
      track("Increment Counter");

      // Get the keypair for the current user.
      const keypair = await enokiFlow.getKeypair({ network: "testnet" });

      // Create a new transaction block
      const txb = new Transaction();

      // Add some transactions to the block...
      txb.moveCall({
        arguments: [
          txb.object(
            "0xd710735500fc1be7dc448b783ad1fb0b5fd209890a67e518cc47e7dc26856aa6",
          ),
        ],
        target:
          "0x5794fff859ee70e28ec8a419f2a73830fb66bcaaaf76a68e41fcaf5e057d7bcc::global_counter::increment",
      });

      try {
        // Sponsor and execute the transaction block, using the Enoki keypair
        const res = await enokiFlow.sponsorAndExecuteTransaction({
          transaction: txb,
          network: "testnet",
          client,
        });

        return res;
      } catch (error) {
        console.log(error);
        throw error;
      }
    };

    toast.promise(promise, {
      loading: "Incrementing counter...",
      success: (data) => {
        return (
          <span className="flex flex-row items-center gap-2">
            Counter incremented!{" "}
            <a
              href={`https://suiscan.xyz/testnet/tx/${data.digest}`}
              target="_blank"
            >
              <ExternalLink width={12} />
            </a>
          </span>
        );
      },
      error: (error) => {
        return error.message;
      },
    });
  }

  return (
    <div className="flex flex-col justify-center items-center bg-[#1b2022] h-screen">
      <div className="flex w-[1016px] justify-between items-center">
        <div className="text-4xl font-bold m-4 uppercase text-white">
          Collepreax
        </div>
        {account ? (
          <AccountInfo></AccountInfo>
        ) : (
          <ZkAccountInfo></ZkAccountInfo>
        )}
      </div>
      <section>
        <div className="flex flex-col items-center sm:flex-row gap-4 sm:items-start max-w-[1200px]">
          <Tvl />
          <OptionsCard
            cb={(v: "Mint" | "Redeem") => {
              setActiveTab(v);
            }}
          ></OptionsCard>
        </div>
        <Card className="mt-9 w-[1016px]">
          <CardHeader>
            <CardTitle>{activeTab} CUSD history</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <ShowTable OptionType={activeTab}></ShowTable>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function AccountInfo() {
  const client = useSuiClient(); // The SuiClient instance
  const { mutate: disconnect } = useDisconnectWallet();
  const account = useCurrentAccount();

  /* The account information of the current user. */
  const [balance, setBalance] = useState<number>(0);
  const [accountLoading, setAccountLoading] = useState<boolean>(true);

  /**
   * Request SUI from the faucet.
   */
  const onRequestSui = async () => {
    const promise = async () => {
      track("Request SUI");

      // Ensures the user is logged in and has a SUI address.
      if (!account?.address) {
        throw new Error("No SUI address found");
      }

      if (balance > 3) {
        throw new Error("You already have enough SUI!");
      }

      // Request SUI from the faucet.
      const res = await requestSuiFromFaucetV0({
        host: getFaucetHost("testnet"),
        recipient: account.address,
      });

      if (res.error) {
        throw new Error(res.error);
      }

      return res;
    };

    toast.promise(promise, {
      loading: "Requesting SUI...",
      success: (data) => {
        console.log("SUI requested successfully!", data);

        const suiBalanceChange = data.transferredGasObjects
          .map((faucetUpdate) => {
            return faucetUpdate.amount / 10 ** 9;
          })
          .reduce((acc: number, change: any) => {
            return acc + change;
          }, 0);

        setBalance(balance + suiBalanceChange);

        return "SUI requested successfully! ";
      },
      error: (error) => {
        return error.message;
      },
    });
  };

  const getAccountInfoWithOutZK = async () => {
    if (!account) {
      return;
    }
    const USDCBalance = await client.getBalance({
      owner: account.address,
      coinType:
        " 0x20a1afd205d76952d37608f6af6707c4f2271ba45b161cb08734556a30cde9f9::USDC::USDC",
    });
    console.log((parseInt(USDCBalance.totalBalance) / 1000000).toFixed(3));
    setBalance(parseInt(USDCBalance.totalBalance) / 1000000);
    setAccountLoading(false);
  };

  /**
   * When the user logs in, fetch the account information.
   */
  useEffect(() => {
    if (account) {
      getAccountInfoWithOutZK();
    }
  }, [account]);

  return (
    <Popover>
      <PopoverTrigger className="max-w-sm" asChild>
        <div>
          <Button className="hidden sm:block" variant={"secondary"}>
            {accountLoading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              `${account?.address?.slice(0, 5)}...${account?.address?.slice(
                63,
              )} - ${balance.toFixed(3)} USDC`
            )}
          </Button>
          <Avatar className="block sm:hidden">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <Card className="border-none shadow-none">
          {/* <Button variant={'ghost'} size='icon' className="relative top-0 right-0" onClick={getAccountInfo}><RefreshCw width={16} /></Button> */}
          <CardHeader>
            <CardTitle>Account Info</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            {accountLoading ? (
              <div className="w-full flex flex-col items-center">
                <LoaderCircle className="animate-spin" />
              </div>
            ) : (
              <>
                <div className="flex flex-row gap-1 items-center">
                  <span>Address: </span>
                  {accountLoading ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <div className="flex flex-row gap-1">
                      <span>{`${account?.address?.slice(
                        0,
                        5,
                      )}...${account?.address?.slice(63)}`}</span>
                      <a
                        href={`https://suiscan.xyz/testnet/account/${account?.address}`}
                        target="_blank"
                      >
                        <ExternalLink width={12} />
                      </a>
                    </div>
                  )}
                </div>
                <div>
                  <span>Balance: </span>
                  <span>{balance.toFixed(3)} USDC</span>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-row gap-2 items-center justify-between">
            <Button
              className="hidden"
              variant={"outline"}
              size={"sm"}
              onClick={onRequestSui}
            >
              Request SUI
            </Button>
            <Button
              variant={"destructive"}
              size={"sm"}
              className="w-full text-center"
              onClick={async () => {
                disconnect();
                window.location.reload();
              }}
            >
              Logout
            </Button>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

function ZkAccountInfo() {
  const client = useSuiClient(); // The SuiClient instance
  const enokiFlow = useEnokiFlow(); // The EnokiFlow instance
  const { address: suiAddress } = useZkLogin(); // The zkLogin instance

  /* The account information of the current user. */
  const [balance, setBalance] = useState<number>(0);
  const [accountLoading, setAccountLoading] = useState<boolean>(true);

  /**
   * Request SUI from the faucet.
   */
  const onRequestSui = async () => {
    const promise = async () => {
      track("Request SUI");

      // Ensures the user is logged in and has a SUI address.
      if (!suiAddress) {
        throw new Error("No SUI address found");
      }

      if (balance > 3) {
        throw new Error("You already have enough SUI!");
      }

      // Request SUI from the faucet.
      const res = await requestSuiFromFaucetV0({
        host: getFaucetHost("testnet"),
        recipient: suiAddress,
      });

      if (res.error) {
        throw new Error(res.error);
      }

      return res;
    };

    toast.promise(promise, {
      loading: "Requesting SUI...",
      success: (data) => {
        console.log("SUI requested successfully!", data);

        const suiBalanceChange = data.transferredGasObjects
          .map((faucetUpdate) => {
            return faucetUpdate.amount / 10 ** 9;
          })
          .reduce((acc: number, change: any) => {
            return acc + change;
          }, 0);

        setBalance(balance + suiBalanceChange);

        return "SUI requested successfully! ";
      },
      error: (error) => {
        return error.message;
      },
    });
  };

  /**
   * Fetch the account information of the current user.
   */
  const getAccountInfo = async () => {
    if (!suiAddress) {
      return;
    }

    setAccountLoading(true);

    const balance = await client.getBalance({
      owner: suiAddress,
      coinType:
        "0x20a1afd205d76952d37608f6af6707c4f2271ba45b161cb08734556a30cde9f9::USDC::USDC",
    });
    setBalance(parseInt(balance.totalBalance) / 10 ** 6);

    setAccountLoading(false);
  };

  /**
   * When the user logs in, fetch the account information.
   */
  useEffect(() => {
    if (suiAddress) {
      getAccountInfo();
    }
  }, [suiAddress]);

  return (
    <Popover>
      <PopoverTrigger className="max-w-sm" asChild>
        <div>
          <Button className="hidden sm:block" variant={"secondary"}>
            {accountLoading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              `${suiAddress?.slice(0, 5)}...${suiAddress?.slice(
                63,
              )} - ${balance.toPrecision(3)} USDC`
            )}
          </Button>
          <Avatar className="block sm:hidden">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <Card className="border-none shadow-none">
          {/* <Button variant={'ghost'} size='icon' className="relative top-0 right-0" onClick={getAccountInfo}><RefreshCw width={16} /></Button> */}
          <CardHeader>
            <CardTitle>Account Info</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            {accountLoading ? (
              <div className="w-full flex flex-col items-center">
                <LoaderCircle className="animate-spin" />
              </div>
            ) : (
              <>
                <div className="flex flex-row gap-1 items-center">
                  <span>Address: </span>
                  {accountLoading ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <div className="flex flex-row gap-1">
                      <span>{`${suiAddress?.slice(
                        0,
                        5,
                      )}...${suiAddress?.slice(63)}`}</span>
                      <a
                        href={`https://suiscan.xyz/testnet/account/${suiAddress}`}
                        target="_blank"
                      >
                        <ExternalLink width={12} />
                      </a>
                    </div>
                  )}
                </div>
                <div>
                  <span>Balance: </span>
                  <span>{balance.toPrecision(3)} USDC</span>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-row gap-2 items-center justify-between">
            <Button
              className="hidden"
              variant={"outline"}
              size={"sm"}
              onClick={onRequestSui}
            >
              Request SUI
            </Button>
            <Button
              variant={"destructive"}
              size={"sm"}
              className="w-full text-center"
              onClick={async () => {
                await enokiFlow.logout();
                window.location.reload();
              }}
            >
              Logout
            </Button>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
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
