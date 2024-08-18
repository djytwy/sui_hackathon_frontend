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
import CountUp from "react-countup";
import Image from "next/image";

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

  /* Counter state */
  const [counter, setCounter] = useState<number>(0);
  const [counterLoading, setCounterLoading] = useState<boolean>(false);
  const [countLoading, setCountLoading] = useState<boolean>(true);

  const [optionType, setOptionType] = useState<"Mint" | "Redeem">("Mint");

  /** Mint info  */
  const [MintNum, setMintNum] = useState<number>(0);
  const [USDCBalance, setUSDCBalance] = useState<string>("0");
  const [EnterNum, setEnterNum] = useState<string>("");
  const [Fee, setFee] = useState<string>("0 USDC");

  /** sum info */
  const [APY, setAPY] = useState<number>();
  const [TVL, setTVL] = useState();

  /**
   * Timeout for the counter.
   * This is used to refresh the counter every 5 seconds.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      getCount();
    }, 5000);
    // 0x9a60c428e4a29fbcce261219f1d6770762de0772ac80d130c747aad869456043
    return () => clearInterval(interval);
  }, []);

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

  async function getCount() {
    const res = (await client.getObject({
      id: "0xd710735500fc1be7dc448b783ad1fb0b5fd209890a67e518cc47e7dc26856aa6",
      options: {
        showContent: true,
      },
    })) as any;

    setCounter(res.data.content.fields.count as number);

    setCountLoading(false);
  }

  /**
   * Increment the global counter. This transaction is sponsored by the app.
   */
  async function incrementCounter() {
    const promise = async () => {
      track("Increment Counter");

      setCounterLoading(true);

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
        setCounterLoading(false);

        return res;
      } catch (error) {
        setCounterLoading(false);
        throw error;
      }
    };

    toast.promise(promise, {
      loading: "Incrementing counter...",
      success: (data) => {
        getCount();
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

  if (suiAddress || account) {
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
            {/* <Card className="max-w-lg">
            <CardHeader>
              <CardTitle>Transfer Transaction Example</CardTitle>
              <CardDescription>
                Transfer SUI to another account. This transaction is not
                sponsored by the app.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col w-full gap-2">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  type="text"
                  id="recipient"
                  placeholder="0xdeadbeef"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="amount">Transfer Amount (SUI)</Label>
                <Input
                  type="text"
                  id="amount"
                  placeholder="1.4"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value as any)}
                />
              </div>
            </CardContent>
            <CardFooter className="w-full flex flex-row items-center justify-center">
              <Button
                className="w-full"
                onClick={transferSui}
                disabled={transferLoading}
              >
                Transfer SUI
              </Button>
            </CardFooter>
          </Card> */}
            <Tvl></Tvl>
            <Card className="w-[480px]">
              <CardHeader>
                <SildeButton
                  active="Mint"
                  wordsList={["Mint", "Redeem"]}
                  device="pc"
                  onChange={(active: string) => {
                    setOptionType(active as "Mint" | "Redeem");
                    setEnterNum("");
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
                    onClick={incrementCounter}
                    disabled={EnterNum === ""}
                    className="w-full"
                  >
                    Mint
                  </Button>
                ) : (
                  <Button
                    onClick={incrementCounter}
                    disabled={EnterNum === ""}
                    className="w-full"
                  >
                    Redeem
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
          <Card className="mt-9 w-[1016px]">
            <CardHeader>
              <CardTitle>{optionType} CUSD history</CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent>
              <ShowTable OptionType={optionType}></ShowTable>
            </CardContent>
          </Card>
        </section>
      </div>
    );
  } else {
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
}

function AccountInfo() {
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
              )} - ${balance.toPrecision(3)} SUI`
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
                  <span>{balance.toPrecision(3)} SUI</span>
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

    const balance = await client.getBalance({ owner: suiAddress });
    setBalance(parseInt(balance.totalBalance) / 10 ** 9);

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
              )} - ${balance.toPrecision(3)} SUI`
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
                  <span>{balance.toPrecision(3)} SUI</span>
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
  const [USDCBalance, setUSDCBalance] = useState<string>("0");

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

function Tvl() {
  return (
    <Card className="w-[520px]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <p>CUSD total Value Locked: </p>
          <CountUp formattingFn={(n) => ` $${n} K`} end={100}></CountUp>
        </CardTitle>
        <CardDescription>
          This number mean is total collateral assets value.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <p>Latest holder APY: </p>
          <div>
            11.2 % <p className="text-xs">(base 4.3% + rewards 6.9%)</p>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <p>CUSD latest distributed to holder (interest): </p>
          <CountUp
            decimals={5}
            formattingFn={(n) => `${n}K CUSD`}
            end={0.943}
          ></CountUp>
        </div>
        <div className="flex items-center justify-between">
          <p>latest distributed to holder (rewards): </p>
          <div className="flex flex-col items-end justify-center gap-y-2">
            <div className="flex items-center gap-x-1">
              <p>102</p>
              <Image src="/sui.svg" alt="sui" width={24} height={24}></Image>
              <p className="w-11">SUI</p>
            </div>

            <div className="flex items-center gap-x-1">
              <p>34</p>
              <Image src="/navx.webp" alt="navx" width={24} height={24}></Image>
              <p className="w-11">NAVX</p>
            </div>

            <div className="flex items-center gap-x-1">
              <p>44</p>
              <Image src="/vsui.png" alt="vsui" width={24} height={24}></Image>
              <p className="w-11">vSUI</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <p>Latest distribute date:</p>
          <p>8/11/2024</p>
        </div>
      </CardContent>
      <CardFooter className="w-full flex flex-row items-center justify-center"></CardFooter>
    </Card>
  );
}
