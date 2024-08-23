import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CountUp from "react-countup";
import Image from "next/image";

export default function Tvl() {
  const [tvl, setTvl] = useState(100);
  const [distributed, setDistributed] = useState(0.943);

  const computedTvl = useMemo(() => {
    return tvl;
  }, [tvl]);

  const computedDistributed = useMemo(() => {
    return distributed;
  }, [distributed]);

  return (
    <Card className="w-[520px]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <p>CUSD total Value Locked: </p>
          <CountUp formattingFn={(n) => ` $${n} K`} end={computedTvl}></CountUp>
        </CardTitle>
        <CardDescription>
          This number mean is total collateral assets value.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <p>Latest holder APY: </p>
          <div className="text-end">
            11.2 % <p className="text-xs">(base 4.3% + rewards 6.9%)</p>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <p>CUSD latest distributed to holder (interest): </p>
          <CountUp
            decimals={5}
            formattingFn={(n) => `${n}K CUSD`}
            end={computedDistributed}
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
