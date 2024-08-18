import React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import Image from "next/image";

const Table = ({ OptionType }: { OptionType: "Mint" | "Redeem" }) => {
  return (
    <div className="pt-0 w-full overflow-x-auto">
      <table className="w-full border-collapse">
        {OptionType === "Mint" ? (
          <thead>
            <tr>
              <th className="border-b border-gray-300 px-4 py-2 pl-0 text-left">
                Mint Date
              </th>
              <th className="border-b border-gray-300 px-4 py-2 text-left">
                Mint Number
              </th>
              <th className="border-b border-gray-300 px-4 py-2 text-left">
                Mint Fee
              </th>
              <th className="border-b border-gray-300 px-4 py-2 text-left">
                Collateral Token Value
              </th>
            </tr>
          </thead>
        ) : (
          <thead>
            <tr>
              <th className="border-b border-gray-300 px-4 py-2 pl-0 text-left">
                Redeem Date
              </th>
              <th className="border-b border-gray-300 px-4 py-2 text-left">
                Redeem Number
              </th>
              <th className="border-b border-gray-300 px-4 py-2 text-left">
                Redeem Fee
              </th>
              <th className="border-b border-gray-300 px-4 py-2 text-left">
                Collateral Value Redeem
              </th>
            </tr>
          </thead>
        )}
        {OptionType === "Mint" ? (
          <tbody>
            <tr>
              <td className="border-b border-gray-300 px-4 py-2 pl-0">
                07/11/2024
              </td>
              <td className="border-b border-gray-300 px-4 py-2">10.3 CUSD</td>
              <td className="border-b border-gray-300 px-4 py-2">$0</td>
              <td className="border-b border-gray-300 px-4 py-2">
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div className="">$ 10.2998</div>
                    </Tooltip.Trigger>
                    <Tooltip.Content className="bg-black text-white p-2 rounded text-sm max-w-xs text-left">
                      <Tooltip.Arrow className="fill-current text-black" />
                    </Tooltip.Content>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </td>
            </tr>
            <tr>
              <td className="border-b border-gray-300 px-4 py-2 pl-0">
                07/11/2024
              </td>
              <td className="border-b border-gray-300 px-4 py-2">10.3 CUSD</td>
              <td className="border-b border-gray-300 px-4 py-2">$0</td>
              <td className="border-b border-gray-300 px-4 py-2">
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div className="">$ 10.2998</div>
                    </Tooltip.Trigger>
                    <Tooltip.Content className="bg-black text-white p-2 rounded text-sm max-w-xs text-left">
                      <Tooltip.Arrow className="fill-current text-black" />
                    </Tooltip.Content>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </td>
            </tr>
            <tr>
              <td className="border-b border-gray-300 px-4 py-2 pl-0">
                07/14/2024
              </td>
              <td className="border-b border-gray-300 px-4 py-2">11.3 CUSD</td>
              <td className="border-b border-gray-300 px-4 py-2">$0</td>
              <td className="border-b border-gray-300 px-4 py-2">
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div className="">$ 11.2998</div>
                    </Tooltip.Trigger>
                    <Tooltip.Content className="bg-black text-white p-2 rounded text-sm max-w-xs text-left">
                      <Tooltip.Arrow className="fill-current text-black" />
                    </Tooltip.Content>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </td>
            </tr>
            <tr>
              <td className="border-b border-gray-300 px-4 py-2 pl-0">
                07/11/2024
              </td>
              <td className="border-b border-gray-300 px-4 py-2">10.3 CUSD</td>
              <td className="border-b border-gray-300 px-4 py-2">$0</td>
              <td className="border-b border-gray-300 px-4 py-2">
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div className="">$ 10.2998</div>
                    </Tooltip.Trigger>
                    <Tooltip.Content className="bg-black text-white p-2 rounded text-sm max-w-xs text-left">
                      <Tooltip.Arrow className="fill-current text-black" />
                    </Tooltip.Content>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            <tr>
              <td className="border-b border-gray-300 px-4 py-2 pl-0">
                18/06/2024
              </td>
              <td className="border-b border-gray-300 px-4 py-2">300.8 CUSD</td>
              <td className="border-b border-gray-300 px-4 py-2">
                {(300.8 * 0.0005).toFixed(4)} CUSD
              </td>
              <td className="border-b border-gray-300 px-4 py-2">
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div className="">${(300.8 * 0.9995).toFixed(4)}</div>
                    </Tooltip.Trigger>
                    <Tooltip.Content className="bg-black text-white p-2 rounded text-sm max-w-xs text-left">
                      Redeem Token is USDC{" "}
                      <Image
                        src="/token_usdc.svg"
                        width={24}
                        height={24}
                        alt="usdc"
                      ></Image>
                    </Tooltip.Content>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </td>
            </tr>
            <tr>
              <td className="border-b border-gray-300 px-4 py-2 pl-0">
                18/06/2024
              </td>
              <td className="border-b border-gray-300 px-4 py-2">300.8 CUSD</td>
              <td className="border-b border-gray-300 px-4 py-2">
                {(300.8 * 0.0005).toFixed(4)} CUSD
              </td>
              <td className="border-b border-gray-300 px-4 py-2">
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div className="">${(300.8 * 0.9995).toFixed(4)}</div>
                    </Tooltip.Trigger>
                    <Tooltip.Content className="bg-black text-white p-2 rounded text-sm max-w-xs text-left">
                      Redeem Token is USDC{" "}
                      <Image
                        src="/token_usdc.svg"
                        width={24}
                        height={24}
                        alt="usdc"
                      ></Image>
                    </Tooltip.Content>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </td>
            </tr>
            <tr>
              <td className="border-b border-gray-300 px-4 py-2 pl-0">
                18/06/2024
              </td>
              <td className="border-b border-gray-300 px-4 py-2">300.8 CUSD</td>
              <td className="border-b border-gray-300 px-4 py-2">
                {(300.8 * 0.0005).toFixed(4)} CUSD
              </td>
              <td className="border-b border-gray-300 px-4 py-2">
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div className="">${(300.8 * 0.9995).toFixed(4)}</div>
                    </Tooltip.Trigger>
                    <Tooltip.Content className="bg-black text-white p-2 rounded text-sm max-w-xs text-left">
                      Redeem Token is USDC{" "}
                      <Image
                        src="/token_usdc.svg"
                        width={24}
                        height={24}
                        alt="usdc"
                      ></Image>
                    </Tooltip.Content>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </td>
            </tr>
            <tr>
              <td className="border-b border-gray-300 px-4 py-2 pl-0">
                18/06/2024
              </td>
              <td className="border-b border-gray-300 px-4 py-2">300.8 CUSD</td>
              <td className="border-b border-gray-300 px-4 py-2">
                {(300.8 * 0.0005).toFixed(4)} CUSD
              </td>
              <td className="border-b border-gray-300 px-4 py-2">
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div className="">${(300.8 * 0.9995).toFixed(4)}</div>
                    </Tooltip.Trigger>
                    <Tooltip.Content className="bg-black text-white p-2 rounded text-sm max-w-xs text-left">
                      Redeem Token is USDC{" "}
                      <Image
                        src="/token_usdc.svg"
                        width={24}
                        height={24}
                        alt="usdc"
                      ></Image>
                    </Tooltip.Content>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </td>
            </tr>
          </tbody>
        )}
      </table>
    </div>
  );
};

export default Table;
